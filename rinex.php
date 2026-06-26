<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require __DIR__ . '/app/lib/gnss_ftp.php';
$user = require_login();
$admin = current_admin();

// Ограничения на размер одного поиска — без них слишком широкий запрос
// (например год целиком × все станции) означал бы тысячи FTP-запросов
// LIST подряд и минуты ожидания страницы, либо архив на десятки ГБ.
const RINEX_MAX_DAYS = 31;
const RINEX_MAX_FILES = 3000;

$pdo = db();
$allStations = $pdo->query('SELECT name FROM stations ORDER BY name')->fetchAll(PDO::FETCH_COLUMN);

function human_size(?int $bytes): string
{
    if ($bytes === null) return '';
    $units = ['Б', 'КБ', 'МБ', 'ГБ'];
    $i = 0;
    while ($bytes >= 1024 && $i < count($units) - 1) {
        $bytes /= 1024;
        $i++;
    }
    return round($bytes, 1) . ' ' . $units[$i];
}

// Переход с карты (станция → "Запросить RINEX") приходит по GET с готовым
// именем станции и предлагает разумные дефолты по времени — последние 24
// часа UTC до текущего момента, чтобы не заставлять сразу лезть в поля дат.
$prefillStation = (string)($_GET['station'] ?? '');
$nowUtc = new DateTimeImmutable('now', new DateTimeZone('UTC'));

$intent = (string)($_POST['intent'] ?? '');
$selectedStations = array_values(array_filter((array)($_POST['stations'] ?? ($prefillStation !== '' ? [$prefillStation] : []))));
$dateFrom = (string)($_POST['date_from'] ?? ($prefillStation !== '' ? $nowUtc->modify('-24 hours')->format('Y-m-d\TH:00') : ''));
$dateTo = (string)($_POST['date_to'] ?? ($prefillStation !== '' ? $nowUtc->format('Y-m-d\TH:00') : ''));
$selectedTypes = array_values(array_filter((array)($_POST['types'] ?? ['mo', 'mn'])));
$mergeByDay = $intent === '' ? true : isset($_POST['merge_by_day']);

$error = null;
$requestCreated = false;
$results = []; // [day_folder => [station => [file, ...]]]
$resultCount = 0;
$truncated = false;

/** Общая валидация полей формы — используется и поиском, и созданием фонового запроса. */
function rinex_validate_form(array $selectedStations, string $dateFrom, string $dateTo): array
{
    if (!$selectedStations) {
        return [null, null, 'Выберите хотя бы одну станцию'];
    }
    if ($dateFrom === '' || $dateTo === '') {
        return [null, null, 'Укажите период (UTC)'];
    }
    try {
        $from = new DateTimeImmutable($dateFrom, new DateTimeZone('UTC'));
        $to = new DateTimeImmutable($dateTo, new DateTimeZone('UTC'));
    } catch (Exception $e) {
        return [null, null, 'Некорректная дата/время'];
    }
    if ($from > $to) {
        return [null, null, 'Начало периода позже конца'];
    }
    $days = (int)$from->diff($to)->days + 1;
    if ($days > RINEX_MAX_DAYS) {
        return [null, null, "Слишком широкий диапазон ($days дней) — максимум " . RINEX_MAX_DAYS . ' дней за один раз, сузьте период'];
    }
    return [$from, $to, null];
}

if ($intent === 'create_request') {
    [$from, $to, $error] = rinex_validate_form($selectedStations, $dateFrom, $dateTo);
    if (!$error && !$selectedTypes) {
        $error = 'Выберите хотя бы один тип файлов';
    }
    if (!$error) {
        $pdo->prepare(
            'INSERT INTO rinex_requests (created_by, stations, date_from_utc, date_to_utc, want_obs, want_nav, merge_by_day)
             VALUES (:created_by, :stations, :date_from, :date_to, :want_obs, :want_nav, :merge_by_day)'
        )->execute([
            'created_by' => $admin['id'] ?? null,
            'stations' => implode(',', $selectedStations),
            'date_from' => $from->format('Y-m-d H:i:00'),
            'date_to' => $to->format('Y-m-d H:i:00'),
            'want_obs' => in_array('mo', $selectedTypes, true) ? 1 : 0,
            'want_nav' => in_array('mn', $selectedTypes, true) ? 1 : 0,
            'merge_by_day' => $mergeByDay ? 1 : 0,
        ]);
        header('Location: /rinex_requests.php');
        exit;
    }
} elseif ($intent === 'search') {
    [$from, $to, $error] = rinex_validate_form($selectedStations, $dateFrom, $dateTo);
    if (!$error) {
        $conn = gnss_ftp_connect();
        if ($conn === false) {
            $error = 'Не удалось подключиться к FTP-серверу GNSS-данных (gnss.host) — попробуйте позже';
        } else {
            $cursor = $from->setTime(0, 0);
            $lastDay = $to->setTime(0, 0);
            while ($cursor <= $lastDay) {
                $dayFolder = gnss_day_folder($cursor);
                foreach ($selectedStations as $station) {
                    $files = gnss_ftp_list_files($conn, $dayFolder, $station);
                    foreach ($files as $f) {
                        $ts = gnss_parse_file_timestamp($f['name']);
                        if ($ts === null || $ts < $from || $ts > $to) {
                            continue; // вне запрошенного часового окна, хотя и в той же папке дня
                        }
                        $isObs = stripos($f['name'], '_MO.') !== false;
                        $isNav = stripos($f['name'], '_MN.') !== false;
                        if ($isObs && !in_array('mo', $selectedTypes, true)) continue;
                        if ($isNav && !in_array('mn', $selectedTypes, true)) continue;
                        if ($resultCount >= RINEX_MAX_FILES) {
                            $truncated = true;
                            break 3;
                        }
                        $results[$dayFolder][$station][] = $f;
                        $resultCount++;
                    }
                }
                $cursor = $cursor->modify('+1 day');
            }
            ftp_close($conn);
        }
    }
}

$pageTitle = 'RINEX файлы';
$pageIcon = 'bi-folder2-open';
require __DIR__ . '/app/views/_head.php';
?>
  <div class="card surface-card mb-3">
    <div class="card-body">
      <h2 class="h6 mb-3">Запрос данных с gnss.host</h2>
      <form method="post" action="/rinex.php" class="row g-3" id="rinexQueryForm">
        <div class="col-md-6">
          <label class="form-label small">Станции*</label>
          <select name="stations[]" class="form-select" multiple size="8" required>
            <?php foreach ($allStations as $s): ?>
              <option value="<?= htmlspecialchars($s, ENT_QUOTES, 'UTF-8') ?>" <?= in_array($s, $selectedStations, true) ? 'selected' : '' ?>><?= htmlspecialchars($s, ENT_QUOTES, 'UTF-8') ?></option>
            <?php endforeach; ?>
          </select>
          <div class="form-text">Зажмите Ctrl (или Cmd на Mac), чтобы выбрать несколько</div>
        </div>
        <div class="col-md-6">
          <div class="row g-2">
            <div class="col-12">
              <label class="form-label small">С* (UTC, дата и час)</label>
              <input type="datetime-local" name="date_from" class="form-control" required value="<?= htmlspecialchars($dateFrom, ENT_QUOTES, 'UTF-8') ?>">
            </div>
            <div class="col-12">
              <label class="form-label small">По* (UTC, дата и час)</label>
              <input type="datetime-local" name="date_to" class="form-control" required value="<?= htmlspecialchars($dateTo, ENT_QUOTES, 'UTF-8') ?>">
            </div>
            <div class="col-12">
              <label class="form-label small d-block">Тип файлов</label>
              <div class="form-check form-check-inline">
                <input type="checkbox" name="types[]" value="mo" class="form-check-input" id="typeMo" <?= in_array('mo', $selectedTypes, true) ? 'checked' : '' ?>>
                <label class="form-check-label" for="typeMo">Наблюдения (MO)</label>
              </div>
              <div class="form-check form-check-inline">
                <input type="checkbox" name="types[]" value="mn" class="form-check-input" id="typeMn" <?= in_array('mn', $selectedTypes, true) ? 'checked' : '' ?>>
                <label class="form-check-label" for="typeMn">Навигация (MN)</label>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input type="checkbox" name="merge_by_day" value="1" class="form-check-input" id="mergeByDay" <?= $mergeByDay ? 'checked' : '' ?>>
            <label class="form-check-label" for="mergeByDay">Объединять смежные часы в один файл за сутки (только для фонового запроса)</label>
          </div>
          <div class="form-text">Файлы объединяются, только если идут подряд без разрыва — при пропуске в несколько минут (станция не передавала данные) получится отдельный файл, а не файл с дыркой.</div>
        </div>
        <div class="col-12 d-flex gap-2 align-items-center">
          <button type="submit" name="intent" value="search" class="btn btn-outline-primary"><i class="bi bi-search"></i> Найти и выбрать файлы</button>
          <button type="submit" name="intent" value="create_request" class="btn btn-primary"><i class="bi bi-clock-history"></i> Сформировать фоновый запрос</button>
          <span class="text-secondary small">Максимум <?= RINEX_MAX_DAYS ?> дней за раз</span>
        </div>
      </form>
      <div class="text-secondary small mt-2">«Найти и выбрать файлы» — мгновенный просмотр и скачивание отдельных часовых файлов прямо сейчас. «Сформировать фоновый запрос» — сборка (и, если включено, объединение по суткам) происходит на сервере в фоне, результат появится в разделе «<a href="/rinex_requests.php">Готовые данные</a>».</div>
    </div>
  </div>

  <?php if ($error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php elseif ($intent === 'search'): ?>
    <?php if ($truncated): ?>
      <div class="alert alert-warning">Найдено больше <?= RINEX_MAX_FILES ?> файлов — показаны первые <?= RINEX_MAX_FILES ?>. Сузьте период или число станций.</div>
    <?php endif; ?>
    <form method="post" action="/rinex_download_zip.php" id="rinexDownloadForm">
      <div class="card surface-card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h6 mb-0">Результаты: <?= $resultCount ?> файл(ов)</h2>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-sm btn-outline-secondary" id="rinexSelectAll">Выбрать все</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" id="rinexSelectNone">Снять все</button>
              <button type="submit" class="btn btn-sm btn-primary" id="rinexDownloadBtn" disabled><i class="bi bi-file-zip"></i> Скачать архивом (.zip)</button>
            </div>
          </div>
          <?php if (!$results): ?>
            <div class="text-muted">Ничего не найдено за выбранный период/станции</div>
          <?php endif; ?>
          <?php foreach ($results as $dayFolder => $byStation): ?>
            <h3 class="h6 mt-3"><i class="bi bi-calendar3"></i> <?= htmlspecialchars($dayFolder, ENT_QUOTES, 'UTF-8') ?></h3>
            <?php foreach ($byStation as $station => $files): ?>
              <div class="table-responsive mb-2">
                <table class="table table-clean table-sm align-middle mb-0">
                  <thead><tr><th style="width:30px"></th><th><?= htmlspecialchars($station, ENT_QUOTES, 'UTF-8') ?></th><th>Размер</th></tr></thead>
                  <tbody>
                  <?php foreach ($files as $f): ?>
                    <tr>
                      <td><input type="checkbox" name="files[]" value="<?= htmlspecialchars($f['path'], ENT_QUOTES, 'UTF-8') ?>" class="form-check-input rinex-file-cb"></td>
                      <td><?= htmlspecialchars($f['name'], ENT_QUOTES, 'UTF-8') ?></td>
                      <td class="text-secondary small"><?= human_size($f['size']) ?></td>
                    </tr>
                  <?php endforeach; ?>
                  </tbody>
                </table>
              </div>
            <?php endforeach; ?>
          <?php endforeach; ?>
        </div>
      </div>
    </form>
  <?php endif; ?>
<?php
$extraScripts = <<<'HTML'
<script>
(function () {
  const form = document.getElementById('rinexDownloadForm');
  if (!form) return;
  const checkboxes = () => Array.from(form.querySelectorAll('.rinex-file-cb'));
  const downloadBtn = document.getElementById('rinexDownloadBtn');
  function syncButton() {
    downloadBtn.disabled = !checkboxes().some((cb) => cb.checked);
  }
  document.getElementById('rinexSelectAll').addEventListener('click', () => {
    checkboxes().forEach((cb) => { cb.checked = true; });
    syncButton();
  });
  document.getElementById('rinexSelectNone').addEventListener('click', () => {
    checkboxes().forEach((cb) => { cb.checked = false; });
    syncButton();
  });
  form.addEventListener('change', syncButton);
  syncButton();
})();
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
