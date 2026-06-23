<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$admin = require_admin_role('admin');

$pdo = db();
$error = null;

$uploadDir = __DIR__ . '/uploads/tours/';
$allowedExt = ['ply', 'splat', 'ksplat', 'las'];

$tourId = (int)($_GET['tour_id'] ?? $_POST['tour_id'] ?? 0);
$tourStmt = $pdo->prepare('SELECT * FROM tours WHERE id = :id');
$tourStmt->execute(['id' => $tourId]);
$tour = $tourStmt->fetch();

if (!$tour) {
    header('Location: /tours.php');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'add') {
        $existingFileName = trim((string)($_POST['existing_file'] ?? ''));
        $sortOrder = (int)($_POST['sort_order'] ?? 0);
        $filePath = null;
        $fileFormat = null;

        if (!empty($_FILES['model_file']['name'])) {
            $origName = (string)$_FILES['model_file']['name'];
            $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExt, true)) {
                $error = 'Недопустимый формат файла. Разрешено: ' . implode(', ', $allowedExt);
            } elseif ($_FILES['model_file']['error'] !== UPLOAD_ERR_OK) {
                $error = 'Ошибка загрузки файла (код ' . $_FILES['model_file']['error'] . '). Возможно, файл превышает лимит хостинга — залейте по FTP и укажите имя файла ниже.';
            } else {
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                $storedName = uniqid('part_', true) . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', $origName);
                if (!move_uploaded_file($_FILES['model_file']['tmp_name'], $uploadDir . $storedName)) {
                    $error = 'Не удалось сохранить загруженный файл на сервере';
                } else {
                    $filePath = $storedName;
                    $fileFormat = $ext;
                }
            }
        } elseif ($existingFileName !== '') {
            $ext = strtolower(pathinfo($existingFileName, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExt, true)) {
                $error = 'Недопустимый формат файла. Разрешено: ' . implode(', ', $allowedExt);
            } elseif (!is_file($uploadDir . $existingFileName)) {
                $error = 'Файл "' . $existingFileName . '" не найден в uploads/tours/ на сервере';
            } else {
                $filePath = $existingFileName;
                $fileFormat = $ext;
            }
        } else {
            $error = 'Загрузите файл или укажите имя уже загруженного файла';
        }

        if (!$error) {
            $pdo->prepare(
                'INSERT INTO tour_files (tour_id, file_path, file_format, sort_order)
                 VALUES (:tour_id, :file_path, :file_format, :sort_order)'
            )->execute([
                'tour_id' => $tourId, 'file_path' => $filePath,
                'file_format' => $fileFormat, 'sort_order' => $sortOrder,
            ]);
            header('Location: /tour_files.php?tour_id=' . $tourId);
            exit;
        }
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $pdo->prepare('SELECT file_path FROM tour_files WHERE id = :id AND tour_id = :tour_id');
        $stmt->execute(['id' => $id, 'tour_id' => $tourId]);
        $row = $stmt->fetch();
        if ($row && is_file($uploadDir . $row['file_path'])) {
            unlink($uploadDir . $row['file_path']);
        }
        $pdo->prepare('DELETE FROM tour_files WHERE id = :id AND tour_id = :tour_id')
            ->execute(['id' => $id, 'tour_id' => $tourId]);
        header('Location: /tour_files.php?tour_id=' . $tourId);
        exit;
    } elseif ($action === 'move') {
        $id = (int)($_POST['id'] ?? 0);
        $direction = (string)($_POST['direction'] ?? '');
        $files = $pdo->prepare('SELECT id, sort_order FROM tour_files WHERE tour_id = :tour_id ORDER BY sort_order, id');
        $files->execute(['tour_id' => $tourId]);
        $list = $files->fetchAll();
        $index = null;
        foreach ($list as $i => $f) {
            if ((int)$f['id'] === $id) {
                $index = $i;
                break;
            }
        }
        $swapWith = $direction === 'up' ? $index - 1 : $index + 1;
        if ($index !== null && isset($list[$swapWith])) {
            $a = $list[$index];
            $b = $list[$swapWith];
            $pdo->prepare('UPDATE tour_files SET sort_order = :so WHERE id = :id')
                ->execute(['so' => $b['sort_order'], 'id' => $a['id']]);
            $pdo->prepare('UPDATE tour_files SET sort_order = :so WHERE id = :id')
                ->execute(['so' => $a['sort_order'], 'id' => $b['id']]);
        }
        header('Location: /tour_files.php?tour_id=' . $tourId);
        exit;
    }
}

$filesStmt = $pdo->prepare('SELECT * FROM tour_files WHERE tour_id = :tour_id ORDER BY sort_order, id');
$filesStmt->execute(['tour_id' => $tourId]);
$files = $filesStmt->fetchAll();

$pageTitle = 'Файлы тура: ' . $tour['name'];
$pageIcon = 'bi-stack';
require __DIR__ . '/app/views/_head.php';
?>
  <p><a href="/tours.php" class="text-decoration-none"><i class="bi bi-arrow-left"></i> К списку туров</a></p>

  <?php if ($error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <div class="card surface-card mb-4">
    <div class="card-body">
      <h2 class="h6 mb-3">Основной файл тура</h2>
      <p class="mb-0"><?= htmlspecialchars($tour['file_path'], ENT_QUOTES, 'UTF-8') ?> <span class="text-secondary small">(<?= htmlspecialchars($tour['file_format'], ENT_QUOTES, 'UTF-8') ?>)</span></p>
      <p class="text-secondary small mb-0">Чтобы заменить основной файл — отредактируйте тур на странице «Туры».</p>
    </div>
  </div>

  <div class="card surface-card mb-4">
    <div class="card-body">
      <h2 class="h6 mb-3">Добавить часть модели</h2>
      <p class="text-secondary small">Если скан собран из нескольких .ply/.splat/.ksplat кусков в одной системе координат — добавьте их здесь по очереди. Просмотрщик на карте загрузит части по очереди (первая видна сразу, не дожидаясь остальных), в порядке, заданном ниже.</p>
      <form method="post" action="/tour_files.php?tour_id=<?= $tourId ?>" enctype="multipart/form-data" class="row g-3" id="tourFileForm">
        <input type="hidden" name="action" value="add">
        <input type="hidden" name="tour_id" value="<?= $tourId ?>">
        <div class="col-md-5">
          <label class="form-label small">Файл части (.ply / .splat / .ksplat / .las)</label>
          <input type="file" name="model_file" class="form-control" accept=".ply,.splat,.ksplat,.las">
        </div>
        <div class="col-md-5">
          <label class="form-label small">Или файл уже на сервере (uploads/tours/...)</label>
          <input type="text" name="existing_file" class="form-control" placeholder="part2.ply">
        </div>
        <div class="col-md-2">
          <label class="form-label small">Порядок</label>
          <input type="number" name="sort_order" class="form-control" value="<?= count($files) ?>">
        </div>
        <div class="col-12 d-none" id="tourFileProgressWrap">
          <div class="progress" style="height: 22px">
            <div class="progress-bar" id="tourFileProgressBar" role="progressbar" style="width: 0%">0%</div>
          </div>
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-primary" id="tourFileFormSubmit">Добавить часть</button>
        </div>
      </form>
    </div>
  </div>

  <div class="card surface-card">
    <div class="card-body">
      <h2 class="h6 mb-3">Список частей (<?= count($files) ?>)</h2>
      <div class="table-responsive">
        <table class="table table-clean align-middle">
          <thead>
            <tr><th>#</th><th>Файл</th><th>Формат</th><th></th></tr>
          </thead>
          <tbody>
          <?php foreach ($files as $i => $f): ?>
            <tr>
              <td><?= $f['sort_order'] ?></td>
              <td><?= htmlspecialchars($f['file_path'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($f['file_format'], ENT_QUOTES, 'UTF-8') ?></td>
              <td class="text-end">
                <form method="post" action="/tour_files.php?tour_id=<?= $tourId ?>" class="d-inline">
                  <input type="hidden" name="action" value="move">
                  <input type="hidden" name="id" value="<?= (int)$f['id'] ?>">
                  <input type="hidden" name="direction" value="up">
                  <button type="submit" class="btn btn-sm btn-outline-secondary" <?= $i === 0 ? 'disabled' : '' ?>><i class="bi bi-arrow-up"></i></button>
                </form>
                <form method="post" action="/tour_files.php?tour_id=<?= $tourId ?>" class="d-inline">
                  <input type="hidden" name="action" value="move">
                  <input type="hidden" name="id" value="<?= (int)$f['id'] ?>">
                  <input type="hidden" name="direction" value="down">
                  <button type="submit" class="btn btn-sm btn-outline-secondary" <?= $i === count($files) - 1 ? 'disabled' : '' ?>><i class="bi bi-arrow-down"></i></button>
                </form>
                <form method="post" action="/tour_files.php?tour_id=<?= $tourId ?>" class="d-inline" onsubmit="return confirm('Удалить часть?');">
                  <input type="hidden" name="action" value="delete">
                  <input type="hidden" name="id" value="<?= (int)$f['id'] ?>">
                  <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$files): ?>
            <tr><td colspan="4" class="text-muted">Дополнительных частей нет — тур состоит из одного файла</td></tr>
          <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
<?php
$extraScripts = <<<'HTML'
<script>
(function () {
  const form = document.getElementById('tourFileForm');
  if (!form) return;
  const wrap = document.getElementById('tourFileProgressWrap');
  const bar = document.getElementById('tourFileProgressBar');
  const submitBtn = document.getElementById('tourFileFormSubmit');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    wrap.classList.remove('d-none');
    bar.style.width = '0%';
    bar.textContent = '0%';

    // form.action может вернуть DOM-элемент <input name="action"> вместо
    // строки URL (см. tours.php) — используем getAttribute.
    const xhr = new XMLHttpRequest();
    xhr.open(form.getAttribute('method') || 'post', form.getAttribute('action'));
    xhr.upload.onprogress = function (evt) {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        bar.style.width = pct + '%';
        bar.textContent = pct + '%';
      }
    };
    xhr.onload = function () {
      document.open();
      document.write(xhr.responseText);
      document.close();
    };
    xhr.onerror = function () {
      submitBtn.disabled = false;
      bar.classList.add('bg-danger');
      bar.textContent = 'Ошибка сети при загрузке';
    };

    // Пустое файловое поле (если файл не выбран) на некоторых хостингах
    // вызывает 404 на весь multipart-запрос — не отправляем его вообще.
    const rawData = new FormData(form);
    const data = new FormData();
    for (const [key, value] of rawData.entries()) {
      if (value instanceof File && value.name === '' && value.size === 0) {
        continue;
      }
      data.append(key, value);
    }
    xhr.send(data);
  });
})();
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';

