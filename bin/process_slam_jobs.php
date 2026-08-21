<?php
declare(strict_types=1);

/**
 * Оркестрация SLAM-пайплайна (перенос slamcloude, см. app/lib/slam.php для
 * порядка шагов). Сочетает два уже проверенных в проекте паттерна:
 *
 *  - Атомарный захват job'а SELECT...FOR UPDATE SKIP LOCKED в транзакции
 *    (тот же приём, что bin/process_rinex_requests.php) — защищает от
 *    двойной обработки при наложении запусков по расписанию.
 *  - Спавн шага как ОТДЕЛЬНОГО detached-процесса без ожидания (тот же
 *    приём, что bin/process_copc_conversions.php/process_splat_transforms.php)
 *    — шаги SLAM могут идти минуты/часы, оркестратор не должен блокироваться.
 *
 * DB-логика целиком в PHP; воркер (bin/slam_step_worker.ps1 -> node.exe
 * slam/steps/<step>.mjs) ничего не знает про БД — только читает контекстный
 * JSON и пишет .done/.error файлы (тот же sidecar-принцип, что .lock/.error
 * у COPC/сплат-пайплайнов), чтобы не плодить доступ к Postgres из Node.
 *
 * Запускать по расписанию (Windows Task Scheduler), как и остальные bin/*.php.
 */

require __DIR__ . '/../app/lib/db.php';
require __DIR__ . '/../app/lib/cli.php';
require __DIR__ . '/../app/lib/slam.php';
require_cli_or_token();

// Столько же обоснование, что MAX_CONCURRENT=1 у сплат-пайплайна (см.
// process_splat_transforms.php) — SLAM-шаги (особенно будущий compute_slam,
// Фаза 3) потенциально так же тяжелы по памяти, и сервер уже дважды падал
// от параллельных тяжёлых конвертаций. Пока нет измеренного профиля
// потребления памяти каждого шага — не рискуем.
const MAX_CONCURRENT = 1;
const STALL_MINUTES = 120;
const STARTUP_GRACE_MINUTES = 15;
const MAX_STALL_RETRIES = 3;

$psScript = __DIR__ . '/slam_step_worker.ps1';
$slamUploadRoot = __DIR__ . '/../uploads/slam';
if (!is_dir($slamUploadRoot)) {
    // На свежем сервере эта папка может ещё не существовать (ни один скан
    // не загружался через slam_scans.php) — без неё realpath() ниже вернёт
    // false и сломает построение путей контекста.
    mkdir($slamUploadRoot, 0777, true);
}
$pdo = db();

function job_paths(int $scanId, string $step): array
{
    $jobsDir = slam_scan_jobs_dir($scanId);
    return [
        'dir' => $jobsDir,
        'lock' => $jobsDir . '/' . $step . '.lock',
        'error' => $jobsDir . '/' . $step . '.error',
        'done' => $jobsDir . '/' . $step . '.done',
        'context' => $jobsDir . '/' . $step . '.context.json',
    ];
}

// ---------------------------------------------------------------------------
// Проход 1: разобрать уже "processing" job'ы — завершились (done/error) или
// зависли (лок пропал/не обновляется дольше STALL_MINUTES без результата).
// ---------------------------------------------------------------------------
$processing = $pdo->query(
    "SELECT * FROM slam_jobs WHERE status = 'processing' ORDER BY id"
)->fetchAll();

foreach ($processing as $job) {
    $scanId = (int)$job['scan_id'];
    $step = $job['pipeline_step'];
    $jobId = (int)$job['id'];
    $paths = job_paths($scanId, $step);

    if (is_file($paths['error'])) {
        $msg = substr((string)file_get_contents($paths['error']), 0, 2000);
        $pdo->prepare(
            "UPDATE slam_jobs SET status = 'error', error_message = :msg, finished_at = NOW() WHERE id = :id"
        )->execute(['msg' => $msg, 'id' => $jobId]);
        $pdo->prepare("UPDATE slam_scans SET status = 'failed', error_message = :msg WHERE id = :id")
            ->execute(['msg' => $msg, 'id' => $scanId]);
        @unlink($paths['error']);
        @unlink($paths['lock']);
        @unlink($paths['context']);
        cli_err("Скан #$scanId, шаг $step: ОШИБКА — $msg");
        continue;
    }

    if (is_file($paths['done'])) {
        $meta = json_decode((string)file_get_contents($paths['done']), true) ?: [];
        $pdo->beginTransaction();
        $pdo->prepare("UPDATE slam_jobs SET status = 'done', finished_at = NOW() WHERE id = :id")
            ->execute(['id' => $jobId]);

        $updates = [];
        $params = ['id' => $scanId];
        if (isset($meta['num_points'])) { $updates[] = 'num_points = :num_points'; $params['num_points'] = (int)$meta['num_points']; }
        if (isset($meta['source_format'])) { $updates[] = 'source_format = :source_format'; $params['source_format'] = (string)$meta['source_format']; }
        if (isset($meta['crs_epsg'])) { $updates[] = 'crs_epsg = :crs_epsg'; $params['crs_epsg'] = (int)$meta['crs_epsg']; }
        if (isset($meta['crs_proj4'])) { $updates[] = 'crs_proj4 = :crs_proj4'; $params['crs_proj4'] = (string)$meta['crs_proj4']; }
        if (isset($meta['rtk_fixed'])) { $updates[] = 'rtk_fixed = :rtk_fixed'; $params['rtk_fixed'] = $meta['rtk_fixed'] ? 1 : 0; }
        if (isset($meta['bbox']) && is_array($meta['bbox']) && count($meta['bbox']) === 4) {
            $updates[] = 'bbox_min_lon = :bminlon, bbox_min_lat = :bminlat, bbox_max_lon = :bmaxlon, bbox_max_lat = :bmaxlat';
            [$params['bminlon'], $params['bminlat'], $params['bmaxlon'], $params['bmaxlat']] = $meta['bbox'];
        }
        if ($updates) {
            $pdo->prepare('UPDATE slam_scans SET ' . implode(', ', $updates) . ' WHERE id = :id')->execute($params);
        }

        foreach ((array)($meta['assets'] ?? []) as $asset) {
            $pdo->prepare(
                'INSERT INTO slam_processed_assets (scan_id, asset_type, step, file_path, file_size)
                 VALUES (:scan_id, :asset_type, :step, :file_path, :file_size)'
            )->execute([
                'scan_id' => $scanId,
                'asset_type' => $asset['type'],
                'step' => $step,
                'file_path' => $asset['path'],
                'file_size' => (int)($asset['size'] ?? 0),
            ]);
        }

        foreach ((array)($meta['inputs'] ?? []) as $input) {
            $pdo->prepare(
                'INSERT INTO slam_scan_inputs (scan_id, kind, file_path, file_size)
                 VALUES (:scan_id, :kind, :file_path, :file_size)
                 ON CONFLICT (scan_id, kind) DO UPDATE SET file_path = EXCLUDED.file_path, file_size = EXCLUDED.file_size'
            )->execute([
                'scan_id' => $scanId,
                'kind' => $input['kind'],
                'file_path' => $input['path'],
                'file_size' => (int)($input['size'] ?? 0),
            ]);
        }

        $next = slam_next_step($step);
        if ($next !== null) {
            $pdo->prepare(
                "INSERT INTO slam_jobs (scan_id, pipeline_step, status) VALUES (:scan_id, :step, 'pending')
                 ON CONFLICT (scan_id, pipeline_step) DO NOTHING"
            )->execute(['scan_id' => $scanId, 'step' => $next]);
        } else {
            $pdo->prepare("UPDATE slam_scans SET status = 'completed' WHERE id = :id")->execute(['id' => $scanId]);
        }
        $pdo->commit();

        // build_octree — последний шаг: связываем готовый COPC с уже
        // существующим вьювером (Фаза 5 плана — вьювер уже умеет всё
        // нужное, "просто связать"). tours.file_path — относительный путь
        // внутри uploads/tours/, а не uploads/slam/, поэтому копируем
        // (не перемещаем — оригинал остаётся в slam_processed_assets)
        // готовый COPC в uploads/tours/slam_<scan_id>/ и создаём/обновляем
        // одну запись tours на скан.
        if ($step === 'build_octree') {
            slam_link_tour($pdo, $scanId);
        }

        @unlink($paths['done']);
        @unlink($paths['lock']);
        @unlink($paths['context']);
        cli_out("Скан #$scanId, шаг $step: готово" . ($next ? ", следующий шаг: $next" : ' (пайплайн завершён)'));
        continue;
    }

    // Ни .done, ни .error — либо ещё работает, либо зависла (процесс убит
    // сбоем/перезагрузкой до finally). См. то же обоснование в
    // process_copc_conversions.php/process_splat_transforms.php.
    $lockAgeMin = is_file($paths['lock']) ? (time() - filemtime($paths['lock'])) / 60 : null;
    $startedAgeMin = $job['started_at'] ? (time() - strtotime($job['started_at'])) / 60 : 0;
    $stalled = false;
    if ($lockAgeMin === null && $startedAgeMin > STARTUP_GRACE_MINUTES) {
        $stalled = true;
        cli_err("Скан #$scanId, шаг $step: завис (лок пропал без результата спустя " . round($startedAgeMin) . " мин)");
    } elseif ($lockAgeMin !== null && $lockAgeMin > STALL_MINUTES) {
        $stalled = true;
        cli_err("Скан #$scanId, шаг $step: завис (лок не обновлялся дольше " . STALL_MINUTES . " мин)");
    }

    if ($stalled) {
        $retries = (int)$job['stall_retries'];
        @unlink($paths['lock']);
        @unlink($paths['context']);
        if ($retries + 1 >= MAX_STALL_RETRIES) {
            $pdo->prepare(
                "UPDATE slam_jobs SET status = 'error', error_message = :msg, finished_at = NOW() WHERE id = :id"
            )->execute([
                'msg' => "Шаг зависал $retries раз подряд (сервер перезапускался/процесс убит без завершения) — автоматические попытки остановлены.",
                'id' => $jobId,
            ]);
            cli_err("Скан #$scanId, шаг $step: превышен лимит автоповторов ($retries), помечен как error");
        } else {
            $pdo->prepare(
                "UPDATE slam_jobs SET status = 'pending', stall_retries = :retries, started_at = NULL WHERE id = :id"
            )->execute(['retries' => $retries + 1, 'id' => $jobId]);
            cli_out("Скан #$scanId, шаг $step: будет перезапущен (попытка " . ($retries + 1) . '/' . MAX_STALL_RETRIES . ')');
        }
    }
}

// ---------------------------------------------------------------------------
// Проход 2: спавн новых job'ов (в пределах MAX_CONCURRENT).
// ---------------------------------------------------------------------------
$runningCount = (int)$pdo->query("SELECT COUNT(*) FROM slam_jobs WHERE status = 'processing'")->fetchColumn();
cli_out("Уже выполняется: $runningCount (лимит " . MAX_CONCURRENT . ')');

$spawned = 0;
while ($runningCount + $spawned < MAX_CONCURRENT) {
    $pdo->beginTransaction();
    $claim = $pdo->query(
        "SELECT * FROM slam_jobs WHERE status = 'pending' ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1"
    )->fetch();
    if (!$claim) {
        $pdo->rollBack();
        break;
    }
    $jobId = (int)$claim['id'];
    $scanId = (int)$claim['scan_id'];
    $step = $claim['pipeline_step'];
    $pdo->prepare(
        "UPDATE slam_jobs SET status = 'processing', started_at = NOW(), updated_at = NOW(), error_message = NULL WHERE id = :id"
    )->execute(['id' => $jobId]);
    $pdo->prepare("UPDATE slam_scans SET status = 'processing' WHERE id = :id")->execute(['id' => $scanId]);
    $pdo->commit();

    $paths = job_paths($scanId, $step);
    if (!is_dir($paths['dir'])) {
        mkdir($paths['dir'], 0777, true);
    }
    $logsDir = slam_scan_logs_dir($scanId);
    if (!is_dir($logsDir)) {
        mkdir($logsDir, 0777, true);
    }
    if (!is_dir(slam_scan_intermediate_dir($scanId))) {
        mkdir(slam_scan_intermediate_dir($scanId), 0777, true);
    }

    // Контекст для воркера: всё, что шаг может захотеть прочитать — сам
    // PHP единственный, кто трогает БД, воркер работает только с файлами.
    $scan = $pdo->prepare('SELECT * FROM slam_scans WHERE id = :id');
    $scan->execute(['id' => $scanId]);
    $scanRow = $scan->fetch();
    $project = $pdo->prepare('SELECT * FROM slam_projects WHERE id = :id');
    $project->execute(['id' => (int)$scanRow['project_id']]);
    $projectRow = $project->fetch();
    $inputs = $pdo->prepare('SELECT kind, file_path, file_size FROM slam_scan_inputs WHERE scan_id = :id');
    $inputs->execute(['id' => $scanId]);
    $inputRows = $inputs->fetchAll();

    $uploadDir = realpath(__DIR__ . '/../uploads/slam') . DIRECTORY_SEPARATOR;
    $context = [
        'scan_id' => $scanId,
        'step' => $step,
        'scan_dir' => slam_scan_dir($scanId),
        'raw_file_path' => $scanRow['raw_file_path'] ? ($uploadDir . $scanRow['raw_file_path']) : null,
        'bag_lidar_enabled' => (bool)$scanRow['bag_lidar_enabled'],
        'skip_georeference' => (bool)$scanRow['skip_georeference'],
        'target_crs_epsg' => $projectRow['target_crs_epsg'] !== null ? (int)$projectRow['target_crs_epsg'] : null,
        'target_crs_wkt' => $projectRow['target_crs_wkt'],
        'crs_proj4' => $scanRow['crs_proj4'],
        'inputs' => array_map(fn($r) => [
            'kind' => $r['kind'],
            'path' => $uploadDir . $r['file_path'],
        ], $inputRows),
        'intermediate' => array_reduce(SLAM_PIPELINE_ORDER, function ($acc, $s) use ($scanId) {
            $acc[$s] = slam_intermediate_path($scanId, $s);
            return $acc;
        }, []),
        'done_file' => $paths['done'],
        'error_file' => $paths['error'],
    ];
    file_put_contents($paths['context'], json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    touch($paths['lock']);

    $logFile = $logsDir . '/' . $step . '_' . $jobId . '.log';
    $cmd = [
        'powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $psScript,
        '-Step', $step,
        '-ContextFile', $paths['context'],
        '-DoneFile', $paths['done'],
        '-ErrorFile', $paths['error'],
        '-LockFile', $paths['lock'],
    ];
    $descriptors = [0 => ['pipe', 'r'], 1 => ['file', $logFile, 'a'], 2 => ['file', $logFile, 'a']];
    $process = proc_open($cmd, $descriptors, $pipes);
    if ($process === false) {
        cli_err("Не удалось запустить шаг $step для скана #$scanId");
        $pdo->prepare("UPDATE slam_jobs SET status = 'pending', started_at = NULL WHERE id = :id")->execute(['id' => $jobId]);
        @unlink($paths['lock']);
        break;
    }
    fclose($pipes[0]);
    $spawned++;
    cli_out("Запущен шаг: скан #$scanId, $step (job #$jobId)");
}

cli_out("Запущено новых job'ов: $spawned");
