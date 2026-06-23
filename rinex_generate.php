<?php

declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require __DIR__ . '/app/lib/rinex_gen/Constants.php';
require __DIR__ . '/app/lib/rinex_gen/GpsNav.php';
require __DIR__ . '/app/lib/rinex_gen/GlonassNav.php';
require __DIR__ . '/app/lib/rinex_gen/NavFile.php';
require __DIR__ . '/app/lib/rinex_gen/RinexObsWriter.php';

$admin = require_admin_role('admin');

$error = null;
$stationsInput = "STA1, 2849854.398, 2169707.184, 5249164.598\n";
$startInput = gmdate('Y-m-d\TH:i', time() - 3600);
$endInput = gmdate('Y-m-d\TH:i', time());
$gpsOnly = false;
$rinexVersion = '2';

/** Разбирает текстовое поле "Имя, X, Y, Z" по одной станции на строку. */
function rgen_parse_stations_input(string $text): array
{
    $stations = [];
    foreach (preg_split('/\r\n|\r|\n/', trim($text)) as $line) {
        $line = trim($line);
        if ($line === '') {
            continue;
        }
        $parts = array_map('trim', explode(',', $line));
        if (count($parts) < 4) {
            throw new InvalidArgumentException('Строка "' . $line . '" — нужно 4 поля: Имя, X, Y, Z');
        }
        [$name, $x, $y, $z] = $parts;
        if ($name === '' || !is_numeric($x) || !is_numeric($y) || !is_numeric($z)) {
            throw new InvalidArgumentException('Некорректная строка станции: "' . $line . '"');
        }
        $stations[] = ['name' => $name, 'ecef' => [(float)$x, (float)$y, (float)$z]];
    }
    if (!$stations) {
        throw new InvalidArgumentException('Укажите хотя бы одну станцию');
    }
    return $stations;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    set_time_limit(0);
    $stationsInput = (string)($_POST['stations'] ?? '');
    $startInput = (string)($_POST['start'] ?? '');
    $endInput = (string)($_POST['end'] ?? '');
    $gpsOnly = isset($_POST['gps_only']);
    $rinexVersion = ($_POST['rinex_version'] ?? '2') === '3' ? '3' : '2';

    try {
        $stations = rgen_parse_stations_input($stationsInput);

        $startUnix = strtotime($startInput . ' UTC');
        $endUnix = strtotime($endInput . ' UTC');
        if ($startUnix === false || $endUnix === false) {
            throw new InvalidArgumentException('Некорректные дата/время начала или конца периода');
        }
        if ($endUnix <= $startUnix) {
            throw new InvalidArgumentException('Конец периода должен быть позже начала');
        }
        if ($endUnix - $startUnix > 7 * 86400) {
            throw new InvalidArgumentException('Максимальный период генерации — 7 суток (иначе файл будет огромным, а расчёт — слишком долгим)');
        }

        // Эфемериды нужны на каждые сутки UTC, которые покрывает период.
        // navPaths запоминаем отдельно от распарсенных данных — сам файл
        // (как есть, без разбора) кладётся в архив на выходе.
        //
        // SP3 (точные эфемериды) раньше тоже клали в архив "бонусом" — не
        // используются в расчёте вообще, только для стороннего ПО. Убрали:
        // SP3 — best-effort (может скачаться не для всех дат/спутников,
        // устаревший rapid-продукт и т.п.), а TBC периодически жалуется на
        // "missing precise ephemeris" для отдельных спутников при ЛЮБОЙ
        // версии файла — похоже, он подхватывает SP3 из той же папки, даже
        // когда выбран Broadcast, и его частичное/неполное присутствие
        // может только мешать, а не помогать.
        $dayFiles = [];
        $navPaths = [];
        $missingDays = [];
        foreach (rgen_dates_in_range($startUnix, $endUnix) as $dayStart) {
            $navPath = rgen_download_nav_for_day($dayStart);
            if ($navPath === null) {
                $missingDays[] = gmdate('Y-m-d', $dayStart);
                continue;
            }
            $dayFiles[] = rgen_parse_nav_file((string)file_get_contents($navPath));
            $navPaths[gmdate('Ymd', $dayStart)] = $navPath;
        }

        // Резервный путь: если автозагрузка не сработала ни на один день и
        // пользователь приложил свой nav-файл — используем его (покрывает
        // только однодневные периоды, т.к. это один файл).
        if ($missingDays && isset($_FILES['nav_file']) && $_FILES['nav_file']['error'] === UPLOAD_ERR_OK) {
            $manualContent = (string)file_get_contents($_FILES['nav_file']['tmp_name']);
            if (str_ends_with(strtolower($_FILES['nav_file']['name']), '.gz')) {
                $manualContent = (string)gzdecode($manualContent);
            }
            if (strpos($manualContent, 'RINEX') !== false) {
                $dayFiles[] = rgen_parse_nav_file($manualContent);
                $manualNavContent = $manualContent;
                $missingDays = [];
            }
        }

        if ($missingDays) {
            throw new RuntimeException(
                'Не удалось автоматически загрузить эфемериды за: ' . implode(', ', $missingDays) . '. ' .
                'Проверьте доступ сервера в интернет до источников из app/config.php (rinex_synth.nav_url_templates), ' .
                'либо приложите navigation-файл вручную ниже и повторите (резерв работает только для периода в пределах одних суток).'
            );
        }

        $eph = rgen_merge_ephemerides($dayFiles);
        if (!$eph['gps'] && !$eph['glonass']) {
            throw new RuntimeException('В загруженных эфемеридах не нашлось ни одной записи GPS/ГЛОНАСС — файл не подходит');
        }

        // Классическое короткое имя RINEX2 (ssssdddf.yyO) — сверено с
        // реальными рабочими файлами ("RP1 2390.25O", "brdc2390.25n"):
        // 4 символа имени + день года (3 цифры) + код сессии ('0' —
        // суточный файл) + точка + 2-значный год + буква типа файла.
        // Раньше использовали обычное "{имя}_{дата}.rnx" — возможно, TBC
        // ориентируется на расширение/имя при импорте, а generic ".rnx" не
        // распознаётся так же надёжно, как классический формат.
        $doy3 = gmdate('z', $startUnix) + 1;
        $yy = gmdate('y', $startUnix);

        $files = [];
        $usedStationCodes = [];
        foreach ($stations as $st) {
            $content = $rinexVersion === '3'
                ? rgen_build_rinex3_obs($st['name'], $st['ecef'], $startUnix, $endUnix, $eph, $gpsOnly)
                : rgen_build_rinex2_obs($st['name'], $st['ecef'], $startUnix, $endUnix, $eph, $gpsOnly);
            if ($rinexVersion === '3') {
                $safeName = preg_replace('/[^A-Za-z0-9_-]/', '_', $st['name']);
                $files[$safeName . '_' . gmdate('Ymd', $startUnix) . '.rnx'] = $content;
            } else {
                // Последние 4 символа, а не первые — у этого пользователя
                // имена станций все начинаются одинаково ("0467p26_3",
                // "0467p26_4", ...), различие только в конце; если бы взяли
                // первые 4, все станции получили бы ОДИН И ТОТ ЖЕ код и
                // затёрли бы файлы друг друга в архиве. Плюс гарантируем
                // уникальность внутри пакета явной проверкой (на случай
                // совпадения и в конце имён).
                $alnum = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $st['name']));
                $stationCode = substr('XXXX' . $alnum, -4);
                if (isset($usedStationCodes[$stationCode])) {
                    foreach (str_split('123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') as $suffix) {
                        $candidate = substr($stationCode, 0, 3) . $suffix;
                        if (!isset($usedStationCodes[$candidate])) {
                            $stationCode = $candidate;
                            break;
                        }
                    }
                }
                $usedStationCodes[$stationCode] = true;
                $files[sprintf('%s%03d0.%sO', $stationCode, $doy3, $yy)] = $content;
            }
        }

        // Broadcast-эфемериды кладём в тот же архив рядом с наблюдениями,
        // чтобы файл можно было сразу обрабатывать сторонним ПО без
        // отдельной загрузки эфемерид. Имя — тоже классическое короткое
        // (как реальный "brdc2390.25n").
        // День года считаем ПО КАЖДОЙ дате отдельно ($dateKey, не
        // $startUnix) — иначе при многосуточном периоде все NAV-файлы
        // получили бы одно и то же имя и затёрли бы друг друга в архиве.
        // (string) на $dateKey обязателен: PHP автоматически превращает
        // строковые ключи массива вида "20260601" в целые числа — substr()
        // на int упал бы с TypeError.
        foreach ($navPaths as $dateKey => $navPath) {
            $dateKey = (string)$dateKey;
            $dayUnix = (int)gmmktime(0, 0, 0, (int)substr($dateKey, 4, 2), (int)substr($dateKey, 6, 2), (int)substr($dateKey, 0, 4));
            $files[sprintf('brdc%03d0.%sn', gmdate('z', $dayUnix) + 1, gmdate('y', $dayUnix))] = (string)file_get_contents($navPath);
        }
        if (isset($manualNavContent)) {
            $files[sprintf('brdc%03d0.%sn', $doy3, $yy)] = $manualNavContent;
        }

        $zipPath = tempnam(sys_get_temp_dir(), 'rnx');
        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::OVERWRITE);
        foreach ($files as $fname => $content) {
            $zip->addFromString($fname, $content);
        }
        $zip->close();

        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="rinex_synth_' . gmdate('Ymd', $startUnix) . '.zip"');
        header('Content-Length: ' . filesize($zipPath));
        readfile($zipPath);
        unlink($zipPath);
        exit;
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
}

$pageTitle = 'Генератор искусственного RINEX';
$pageIcon = 'bi-magic';
require __DIR__ . '/app/views/_head.php';
?>
  <div class="card surface-card">
    <div class="card-body">
      <p class="text-secondary">
        Создаёт искусственный RINEX OBS-файл (2.10 или 3.04, GPS + ГЛОНАСС, интервал 5 с) для заданных
        неподвижных точек по их ECEF-координатам — с часами спутника/приёмника, тропосферой,
        ионосферой и целочисленной неоднозначностью фазы. Приёмник/антенна — всегда "CHC i50".
        На выходе .zip: наблюдения по каждой станции (имя — классическое короткое RINEX2, например
        "P2632390.26O") + broadcast-эфемериды за период (подгружаются автоматически).
      </p>

      <?php if ($error): ?>
        <div class="alert alert-danger"><?= nl2br(htmlspecialchars($error, ENT_QUOTES, 'UTF-8')) ?></div>
      <?php endif; ?>

      <form method="post" action="/rinex_generate.php" enctype="multipart/form-data" class="row g-3">
        <div class="col-12">
          <label class="form-label small">Станции — по одной на строку: Имя, X, Y, Z (ECEF, метры)</label>
          <textarea name="stations" class="form-control" rows="5" required><?= htmlspecialchars($stationsInput, ENT_QUOTES, 'UTF-8') ?></textarea>
          <div class="form-text">Несколько станций — в архиве будет отдельный .rnx на каждую.</div>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Начало периода (UTC)</label>
          <input type="datetime-local" name="start" class="form-control" value="<?= htmlspecialchars($startInput, ENT_QUOTES, 'UTF-8') ?>" required>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Конец периода (UTC)</label>
          <input type="datetime-local" name="end" class="form-control" value="<?= htmlspecialchars($endInput, ENT_QUOTES, 'UTF-8') ?>" required>
        </div>
        <div class="col-12">
          <label class="form-label small">Резерв: navigation-файл вручную (.rnx / .rnx.gz), если автозагрузка эфемерид не сработает</label>
          <input type="file" name="nav_file" class="form-control" accept=".rnx,.gz,.24n,.nav">
        </div>
        <div class="col-md-6">
          <label class="form-label small">Версия RINEX</label>
          <select name="rinex_version" class="form-select">
            <option value="2" <?= $rinexVersion === '2' ? 'selected' : '' ?>>2.10 (классический, проверено — принимается)</option>
            <option value="3" <?= $rinexVersion === '3' ? 'selected' : '' ?>>3.04 (мультисистемный, современный)</option>
          </select>
        </div>
        <div class="col-md-6 d-flex align-items-end">
          <div class="form-check">
            <input type="checkbox" class="form-check-input" name="gps_only" id="gpsOnly" value="1" <?= $gpsOnly ? 'checked' : '' ?>>
            <label class="form-check-label" for="gpsOnly">Только GPS (диагностика): файл объявляет себя "G (GPS)" и не содержит ни одной записи ГЛОНАСС</label>
          </div>
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-primary"><i class="bi bi-magic"></i> Сгенерировать и скачать</button>
        </div>
      </form>
    </div>
  </div>
<?php require __DIR__ . '/app/views/_foot.php'; ?>
