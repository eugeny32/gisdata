<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require __DIR__ . '/app/lib/slam.php';
$admin = require_admin_role('admin');

$pdo = db();
$error = null;
$uploadDir = __DIR__ . '/uploads/slam/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$projectId = (int)($_GET['project_id'] ?? $_POST['project_id'] ?? 0);
$projectStmt = $pdo->prepare('SELECT * FROM slam_projects WHERE id = :id');
$projectStmt->execute(['id' => $projectId]);
$project = $projectStmt->fetch();
if (!$project) {
    header('Location: /slam_projects.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 0 && empty($_POST) && empty($_FILES)) {
        $postMaxSize = ini_get('post_max_size');
        $uploadMaxFilesize = ini_get('upload_max_filesize');
        $error = "Файл слишком большой для загрузки через форму (лимит хостинга post_max_size={$postMaxSize}, upload_max_filesize={$uploadMaxFilesize}). " .
            'Залейте ZIP по FTP в uploads/slam/_incoming/ и укажите его имя в поле «Или файл уже на сервере».';
    }

    $action = (string)($_POST['action'] ?? '');

    if ($action === 'upload') {
        $name = trim((string)($_POST['name'] ?? ''));
        $existingFileName = trim((string)($_POST['existing_file'] ?? ''));
        if ($name === '') {
            $error = 'Укажите название скана';
        } elseif (empty($_FILES['scan_zip']['name']) && $existingFileName === '') {
            $error = 'Загрузите ZIP-архив (bag + calibration.yaml) или укажите имя уже загруженного файла';
        } else {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare(
                "INSERT INTO slam_scans (project_id, name, status, created_by) VALUES (:project_id, :name, 'uploaded', :admin_id) RETURNING id"
            );
            $stmt->execute(['project_id' => $projectId, 'name' => $name, 'admin_id' => $admin['id']]);
            $scanId = (int)$stmt->fetchColumn();

            $scanDir = slam_scan_dir($scanId);
            $rawDir = $scanDir . '/raw';
            mkdir($rawDir, 0777, true);

            $rawRelPath = null;
            if (!empty($_FILES['scan_zip']['name'])) {
                if ($_FILES['scan_zip']['error'] !== UPLOAD_ERR_OK) {
                    $error = 'Ошибка загрузки файла (код ' . $_FILES['scan_zip']['error'] . '). Для крупных архивов залейте по FTP в uploads/slam/_incoming/.';
                } else {
                    $storedName = 'scan.zip';
                    if (!move_uploaded_file($_FILES['scan_zip']['tmp_name'], $rawDir . '/' . $storedName)) {
                        $error = 'Не удалось сохранить загруженный файл на сервере';
                    } else {
                        $rawRelPath = $scanId . '/raw/' . $storedName;
                    }
                }
            } else {
                $incomingPath = $uploadDir . '_incoming/' . $existingFileName;
                if (!is_file($incomingPath)) {
                    $error = 'Файл "' . $existingFileName . '" не найден в uploads/slam/_incoming/ на сервере';
                } else {
                    $storedName = 'scan.zip';
                    if (!rename($incomingPath, $rawDir . '/' . $storedName)) {
                        $error = 'Не удалось переместить файл на сервере';
                    } else {
                        $rawRelPath = $scanId . '/raw/' . $storedName;
                    }
                }
            }

            if ($error !== null || $rawRelPath === null) {
                $pdo->rollBack();
                @rmdir($rawDir);
                @rmdir($scanDir);
            } else {
                $pdo->prepare('UPDATE slam_scans SET raw_file_path = :path WHERE id = :id')
                    ->execute(['path' => $rawRelPath, 'id' => $scanId]);
                $pdo->prepare("INSERT INTO slam_jobs (scan_id, pipeline_step, status) VALUES (:id, 'compute_slam', 'pending')")
                    ->execute(['id' => $scanId]);
                $pdo->commit();
                header('Location: /slam_scans.php?project_id=' . $projectId);
                exit;
            }
        }
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $pdo->prepare('DELETE FROM slam_scans WHERE id = :id AND project_id = :project_id')
            ->execute(['id' => $id, 'project_id' => $projectId]);
        header('Location: /slam_scans.php?project_id=' . $projectId);
        exit;
    } elseif ($action === 'toggle_skip_georeference') {
        // Переключить обход GEOREFERENCE (см. slam/steps/georeference.mjs) и
        // сразу пересчитать georeference+build_octree с новой настройкой —
        // при включении обхода также сбрасываем crs_proj4/bbox: они
        // остались бы от старой (RTK-based) привязки и build_octree.mjs
        // ошибочно пометил бы ими локальные SLAM-координаты как UTM.
        $id = (int)($_POST['id'] ?? 0);
        $row = $pdo->prepare('SELECT skip_georeference FROM slam_scans WHERE id = :id AND project_id = :project_id');
        $row->execute(['id' => $id, 'project_id' => $projectId]);
        $scanRow = $row->fetch();
        if ($scanRow) {
            $next = $scanRow['skip_georeference'] ? 0 : 1;
            if ($next) {
                $pdo->prepare(
                    'UPDATE slam_scans SET skip_georeference = 1,
                       crs_proj4 = NULL, crs_epsg = NULL,
                       bbox_min_lon = NULL, bbox_min_lat = NULL, bbox_max_lon = NULL, bbox_max_lat = NULL
                     WHERE id = :id'
                )->execute(['id' => $id]);
            } else {
                $pdo->prepare('UPDATE slam_scans SET skip_georeference = 0 WHERE id = :id')->execute(['id' => $id]);
            }
            $pdo->prepare(
                "UPDATE slam_jobs SET status = 'pending', error_message = NULL, stall_retries = 0
                 WHERE scan_id = :id AND pipeline_step IN ('georeference', 'build_octree')"
            )->execute(['id' => $id]);
        }
        header('Location: /slam_scans.php?project_id=' . $projectId);
        exit;
    } elseif ($action === 'retry') {
        // Сброс проваленных job'ов скана обратно в pending — вручную, после
        // того как причина ошибки устранена (см. error_message в таблице).
        $id = (int)($_POST['id'] ?? 0);
        $pdo->prepare("UPDATE slam_jobs SET status = 'pending', error_message = NULL, stall_retries = 0 WHERE scan_id = :id AND status = 'error'")
            ->execute(['id' => $id]);
        $pdo->prepare("UPDATE slam_scans SET status = 'processing', error_message = NULL WHERE id = :id")->execute(['id' => $id]);
        header('Location: /slam_scans.php?project_id=' . $projectId);
        exit;
    }
}

$scans = $pdo->prepare('SELECT * FROM slam_scans WHERE project_id = :project_id ORDER BY created_at DESC');
$scans->execute(['project_id' => $projectId]);
$scanRows = $scans->fetchAll();

$jobsByScan = [];
if ($scanRows) {
    $ids = array_column($scanRows, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $jobsStmt = $pdo->prepare("SELECT * FROM slam_jobs WHERE scan_id IN ($placeholders) ORDER BY id");
    $jobsStmt->execute($ids);
    foreach ($jobsStmt->fetchAll() as $job) {
        $jobsByScan[(int)$job['scan_id']][] = $job;
    }
}

$toursByScan = [];
if ($scanRows) {
    $ids = array_column($scanRows, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $toursStmt = $pdo->prepare("SELECT id, slam_scan_id FROM tours WHERE slam_scan_id IN ($placeholders)");
    $toursStmt->execute($ids);
    foreach ($toursStmt->fetchAll() as $t) {
        $toursByScan[(int)$t['slam_scan_id']] = (int)$t['id'];
    }
}

$pageTitle = 'SLAM: ' . $project['name'];
$pageIcon = 'bi-radar';
require __DIR__ . '/app/views/_head.php';
?>
  <?php if ($error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <div class="d-flex justify-content-between align-items-center mb-3">
    <div>
      <a href="/slam_projects.php" class="text-decoration-none small"><i class="bi bi-arrow-left"></i> Все проекты</a>
      <h2 class="h6 mb-0 mt-1">Сканы проекта «<?= htmlspecialchars($project['name'], ENT_QUOTES, 'UTF-8') ?>»</h2>
    </div>
    <button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#uploadScanModal"><i class="bi bi-upload"></i> Загрузить скан</button>
  </div>

  <div class="card surface-card">
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-clean align-middle">
          <thead>
            <tr><th>Название</th><th>Статус</th><th style="min-width:280px">Шаги пайплайна</th><th>Точек</th><th></th></tr>
          </thead>
          <tbody>
          <?php foreach ($scanRows as $scan): ?>
            <?php
            $jobs = $jobsByScan[(int)$scan['id']] ?? [];
            $jobByStep = [];
            foreach ($jobs as $j) { $jobByStep[$j['pipeline_step']] = $j; }
            $statusBadge = [
                'uploaded' => 'secondary', 'processing' => 'info', 'completed' => 'success', 'failed' => 'danger',
            ][$scan['status']] ?? 'secondary';
            ?>
            <tr>
              <td><?= htmlspecialchars($scan['name'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><span class="badge text-bg-<?= $statusBadge ?>"><?= htmlspecialchars($scan['status'], ENT_QUOTES, 'UTF-8') ?></span></td>
              <td>
                <div class="d-flex flex-wrap gap-1">
                <?php foreach (SLAM_PIPELINE_ORDER as $step): ?>
                  <?php
                    $j = $jobByStep[$step] ?? null;
                    $st = $j['status'] ?? null;
                    $cls = ['done' => 'success', 'processing' => 'info', 'error' => 'danger', 'pending' => 'secondary', 'skipped' => 'light'][$st] ?? 'light text-muted';
                  ?>
                  <span class="badge text-bg-<?= $cls ?>" title="<?= htmlspecialchars(slam_step_label($step) . ($j['error_message'] ? ': ' . $j['error_message'] : ''), ENT_QUOTES, 'UTF-8') ?>">
                    <?= htmlspecialchars(slam_step_label($step), ENT_QUOTES, 'UTF-8') ?>
                  </span>
                <?php endforeach; ?>
                </div>
              </td>
              <td><?= $scan['num_points'] !== null ? number_format((int)$scan['num_points'], 0, '', ' ') : '—' ?></td>
              <td class="text-end">
                <?php if (isset($toursByScan[$scan['id']])): ?>
                  <a href="/tour_view.php?tour=<?= (int)$toursByScan[$scan['id']] ?>" target="_blank" class="btn btn-sm btn-outline-success"><i class="bi bi-eye"></i> Открыть</a>
                <?php endif; ?>
                <?php if ($scan['status'] === 'failed'): ?>
                  <form method="post" action="/slam_scans.php?project_id=<?= $projectId ?>" class="d-inline">
                    <input type="hidden" name="action" value="retry">
                    <input type="hidden" name="id" value="<?= (int)$scan['id'] ?>">
                    <button type="submit" class="btn btn-sm btn-outline-warning"><i class="bi bi-arrow-clockwise"></i> Повторить</button>
                  </form>
                <?php endif; ?>
                <form method="post" action="/slam_scans.php?project_id=<?= $projectId ?>" class="d-inline"
                      onsubmit="return confirm('<?= $scan['skip_georeference'] ? 'Вернуть привязку по GPS/RTK и пересчитать geopривязку заново?' : 'Отключить привязку по GPS/RTK — облако останется в локальных SLAM-координатах? Пересчитает georeference и build_octree.' ?>')">
                  <input type="hidden" name="action" value="toggle_skip_georeference">
                  <input type="hidden" name="id" value="<?= (int)$scan['id'] ?>">
                  <button type="submit" class="btn btn-sm btn-outline-secondary"
                          title="<?= $scan['skip_georeference'] ? 'Сейчас: локальные координаты (GPS/RTK отключён) — нажмите, чтобы включить обратно' : 'Отключить привязку по GPS/RTK, оставить локальные SLAM-координаты' ?>">
                    <i class="bi <?= $scan['skip_georeference'] ? 'bi-geo-alt-fill text-warning' : 'bi-geo-alt' ?>"></i>
                  </button>
                </form>
                <form method="post" action="/slam_scans.php?project_id=<?= $projectId ?>" class="d-inline" onsubmit="return confirm('Удалить скан?')">
                  <input type="hidden" name="action" value="delete">
                  <input type="hidden" name="id" value="<?= (int)$scan['id'] ?>">
                  <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$scanRows): ?>
            <tr><td colspan="5" class="text-muted">Нет сканов</td></tr>
          <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="modal fade" id="uploadScanModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <form method="post" action="/slam_scans.php?project_id=<?= $projectId ?>" enctype="multipart/form-data" id="uploadScanForm">
          <input type="hidden" name="action" value="upload">
          <div class="modal-header">
            <h5 class="modal-title">Новый скан</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body row g-3">
            <div id="uploadScanError" class="col-12 alert alert-danger d-none mb-0"></div>
            <div class="col-12">
              <label class="form-label small">Название*</label>
              <input type="text" name="name" class="form-control" required>
            </div>
            <div class="col-12">
              <label class="form-label small">ZIP-архив (bag + calibration.yaml)</label>
              <input type="file" name="scan_zip" class="form-control" accept=".zip">
            </div>
            <div class="col-12">
              <label class="form-label small">Или файл уже на сервере (в uploads/slam/_incoming/)</label>
              <input type="text" name="existing_file" class="form-control" placeholder="scan_123.zip">
            </div>
            <div class="col-12 text-secondary small">
              Обработка запускается автоматически (шаг compute_slam → decode_raw → ... → build_octree,
              см. bin/process_slam_jobs.php). Готовое облако появится в списке туров и здесь как кнопка «Открыть».
              Для очень крупных архивов (единицы/десятки ГБ) браузерная загрузка может упираться в ограничения
              сети на пути к серверу (не в лимиты самого приложения) — в этом случае надёжнее загрузить файл по
              FTP в uploads/slam/_incoming/ и указать его имя выше.
            </div>
            <div class="col-12 d-none" id="uploadScanProgressWrap">
              <div class="progress" role="progressbar" style="height: 20px">
                <div class="progress-bar" id="uploadScanProgressBar" style="width: 0%">0%</div>
              </div>
              <div class="text-secondary small mt-1" id="uploadScanProgressLabel"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" id="uploadScanCancelBtn">Закрыть</button>
            <button type="submit" class="btn btn-primary" id="uploadScanSubmitBtn">Загрузить и обработать</button>
          </div>
        </form>
      </div>
    </div>
  </div>
<?php
$extraScripts = <<<'HTML'
<script>
(function () {
  const form = document.getElementById('uploadScanForm');
  const fileInput = form.querySelector('input[name="scan_zip"]');
  const errorBox = document.getElementById('uploadScanError');
  const progressWrap = document.getElementById('uploadScanProgressWrap');
  const progressBar = document.getElementById('uploadScanProgressBar');
  const progressLabel = document.getElementById('uploadScanProgressLabel');
  const submitBtn = document.getElementById('uploadScanSubmitBtn');
  const cancelBtn = document.getElementById('uploadScanCancelBtn');

  function formatBytes(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + ' ГБ';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + ' МБ';
    return Math.round(n / 1e3) + ' КБ';
  }

  form.addEventListener('submit', function (e) {
    // Прогресс имеет смысл только когда реально идёт файл через браузер —
    // путь "файл уже на сервере" (FTP) отправляет обычный маленький POST,
    // для него обычная отправка формы (с редиректом) проще и надёжнее.
    if (!fileInput.files || !fileInput.files.length) {
      return;
    }
    e.preventDefault();
    errorBox.classList.add('d-none');
    progressWrap.classList.remove('d-none');
    submitBtn.disabled = true;
    cancelBtn.disabled = true;

    const xhr = new XMLHttpRequest();
    // form.action (не getAttribute) тут вернул бы САМ <input name="action">
    // (форма содержит одноимённое поле, а именованные поля формы
    // перекрывают одноимённые свойства DOM-элемента, включая .action) —
    // отсюда был мусорный URL "/[object HTMLInputElement]" вместо реального.
    xhr.open('POST', form.getAttribute('action'), true);
    xhr.upload.addEventListener('progress', function (ev) {
      if (!ev.lengthComputable) return;
      const pct = Math.round((ev.loaded / ev.total) * 100);
      progressBar.style.width = pct + '%';
      progressBar.textContent = pct + '%';
      progressLabel.textContent = formatBytes(ev.loaded) + ' из ' + formatBytes(ev.total);
    });
    xhr.addEventListener('load', function () {
      // Успех — сервер отвечает редиректом (XHR его прозрачно проходит и
      // возвращает финальную страницу); при ошибке валидации сервер
      // перерисовывает эту же страницу с сообщением в $error, тоже 200 —
      // проще всего в обоих случаях просто перезагрузить страницу и дать
      // серверу самому показать актуальное состояние (список сканов или
      // алерт с ошибкой), не пытаясь угадывать успех/неудачу по разметке.
      window.location.reload();
    });
    xhr.addEventListener('error', showNetworkError);
    xhr.addEventListener('timeout', showNetworkError);
    xhr.upload.addEventListener('error', showNetworkError);

    function showNetworkError() {
      progressWrap.classList.add('d-none');
      submitBtn.disabled = false;
      cancelBtn.disabled = false;
      errorBox.textContent = 'Загрузка прервана на сети (частая причина для крупных файлов — ' +
        'ограничение на пути к серверу, не самого приложения). Попробуйте залить файл по FTP в ' +
        'uploads/slam/_incoming/ и указать его имя в поле «Или файл уже на сервере».';
      errorBox.classList.remove('d-none');
    }

    xhr.send(new FormData(form));
  });
})();
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
