<?php
declare(strict_types=1);

/**
 * Общие константы/хелперы SLAM-пайплайна (перенос slamcloude, см.
 * bin/process_slam_jobs.php). Порядок шагов и правило "что идёт за чем" —
 * прямой перенос PIPELINE_ORDER из slamcloude/backend/app/models.py,
 * включая нюанс, что реально colorize выполняется ДО georeference (см.
 * slamcloude/worker/pipeline/tasks.py, комментарий у PipelineStep.COLORIZE) —
 * colorize проецирует камеру на точки в ЛОКАЛЬНОЙ SLAM-системе координат,
 * которая ещё не превращена в UTM.
 */

const SLAM_PIPELINE_ORDER = [
    'compute_slam',
    'decode_raw',
    'filter_outliers',
    'bin_to_rinex',
    'ppk_correction',
    'colorize',
    'georeference',
    'build_octree',
];

function slam_next_step(string $step): ?string
{
    $idx = array_search($step, SLAM_PIPELINE_ORDER, true);
    if ($idx === false || $idx + 1 >= count(SLAM_PIPELINE_ORDER)) {
        return null;
    }
    return SLAM_PIPELINE_ORDER[$idx + 1];
}

/** Абсолютный путь к рабочей папке скана: uploads/slam/<scan_id>/ */
function slam_scan_dir(int $scanId): string
{
    return __DIR__ . '/../../uploads/slam/' . $scanId;
}

function slam_scan_jobs_dir(int $scanId): string
{
    return slam_scan_dir($scanId) . '/jobs';
}

function slam_scan_logs_dir(int $scanId): string
{
    return slam_scan_dir($scanId) . '/logs';
}

function slam_scan_intermediate_dir(int $scanId): string
{
    return slam_scan_dir($scanId) . '/intermediate';
}

/**
 * Промежуточный выход шага пайплайна (аналог intermediate_key в tasks.py).
 * Расширение НАМЕРЕННО .las, не .laz — slam/lib/lasIO.mjs пишет
 * несжатый LAS (см. докстринг файла); настоящее LAZ/COPC-сжатие происходит
 * только в самом последнем шаге build_octree.mjs через pdal.exe/untwine.exe
 * (тот же паттерн, что bin/copc_convert_worker.ps1).
 */
function slam_intermediate_path(int $scanId, string $step): string
{
    return slam_scan_intermediate_dir($scanId) . '/' . $step . '.las';
}

/**
 * Копирует готовый COPC скана в uploads/tours/ и создаёт/обновляет одну
 * запись tours на скан (см. sql/schema.sql tours.slam_scan_id) — вьювер
 * gisdata (tour_view.php/map.php) уже умеет COPC-стриминг+LOD, ничего
 * дополнительно писать не нужно (Фаза 5 плана переноса slamcloude).
 */
function slam_link_tour(PDO $pdo, int $scanId): void
{
    $asset = $pdo->prepare(
        "SELECT file_path FROM slam_processed_assets WHERE scan_id = :id AND asset_type = 'copc'
         ORDER BY created_at DESC LIMIT 1"
    );
    $asset->execute(['id' => $scanId]);
    $copcRelPath = $asset->fetchColumn();
    if (!$copcRelPath) {
        return;
    }

    $scanStmt = $pdo->prepare('SELECT * FROM slam_scans WHERE id = :id');
    $scanStmt->execute(['id' => $scanId]);
    $scan = $scanStmt->fetch();
    if (!$scan) {
        return;
    }

    $srcAbs = realpath(__DIR__ . '/../../uploads/slam/' . $copcRelPath);
    if ($srcAbs === false) {
        return;
    }
    $destRelDir = 'slam_' . $scanId;
    $destRelPath = $destRelDir . '/pointcloud.copc.laz';
    $destAbsDir = __DIR__ . '/../../uploads/tours/' . $destRelDir;
    if (!is_dir($destAbsDir)) {
        mkdir($destAbsDir, 0777, true);
    }
    copy($srcAbs, $destAbsDir . '/pointcloud.copc.laz');

    $lat = $scan['bbox_min_lat'] !== null && $scan['bbox_max_lat'] !== null
        ? ((float)$scan['bbox_min_lat'] + (float)$scan['bbox_max_lat']) / 2 : 0;
    $lon = $scan['bbox_min_lon'] !== null && $scan['bbox_max_lon'] !== null
        ? ((float)$scan['bbox_min_lon'] + (float)$scan['bbox_max_lon']) / 2 : 0;

    $existing = $pdo->prepare('SELECT id FROM tours WHERE slam_scan_id = :scan_id');
    $existing->execute(['scan_id' => $scanId]);
    $tourId = $existing->fetchColumn();

    if ($tourId) {
        $pdo->prepare(
            'UPDATE tours SET name = :name, lat = :lat, lon = :lon, file_path = :file_path, file_format = :file_format WHERE id = :id'
        )->execute([
            'name' => $scan['name'], 'lat' => $lat, 'lon' => $lon,
            'file_path' => $destRelPath, 'file_format' => 'las', 'id' => $tourId,
        ]);
    } else {
        $pdo->prepare(
            'INSERT INTO tours (name, lat, lon, file_path, file_format, is_enabled, slam_scan_id)
             VALUES (:name, :lat, :lon, :file_path, :file_format, 1, :scan_id)'
        )->execute([
            'name' => $scan['name'], 'lat' => $lat, 'lon' => $lon,
            'file_path' => $destRelPath, 'file_format' => 'las', 'scan_id' => $scanId,
        ]);
    }
}

function slam_step_label(string $step): string
{
    static $labels = [
        'compute_slam' => 'SLAM (Voxel-SLAM)',
        'decode_raw' => 'Декодирование bag',
        'filter_outliers' => 'Фильтр выбросов',
        'bin_to_rinex' => 'BIN → RINEX',
        'ppk_correction' => 'PPK-коррекция',
        'colorize' => 'Раскраска по камере',
        'georeference' => 'Георефренсинг',
        'build_octree' => 'Построение октодерева',
    ];
    return $labels[$step] ?? $step;
}
