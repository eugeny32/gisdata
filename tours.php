<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$admin = require_admin_role('admin');

$pdo = db();
$error = null;
$edit = null;

$uploadDir = __DIR__ . '/uploads/tours/';
$allowedExt = ['ply', 'splat', 'ksplat'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'save') {
        $id          = (int)($_POST['id'] ?? 0);
        $name        = trim((string)($_POST['name'] ?? ''));
        $description = trim((string)($_POST['description'] ?? ''));
        $lat         = (float)($_POST['lat'] ?? 0);
        $lon         = (float)($_POST['lon'] ?? 0);
        $existingFileName = trim((string)($_POST['existing_file'] ?? ''));
        $isEnabled   = isset($_POST['is_enabled']) ? 1 : 0;

        if ($name === '') {
            $error = 'Укажите название тура';
        } else {
            $filePath = null;
            $fileFormat = null;

            if (!empty($_FILES['model_file']['name'])) {
                $origName = (string)$_FILES['model_file']['name'];
                $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
                if (!in_array($ext, $allowedExt, true)) {
                    $error = 'Недопустимый формат файла. Разрешено: ' . implode(', ', $allowedExt);
                } elseif ($_FILES['model_file']['error'] !== UPLOAD_ERR_OK) {
                    $error = 'Ошибка загрузки файла (код ' . $_FILES['model_file']['error'] . '). Возможно, файл превышает лимит хостинга (upload_max_filesize/post_max_size) — попробуйте залить файл по FTP и указать его имя в поле «Файл уже на сервере».';
                } else {
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }
                    $storedName = uniqid('tour_', true) . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', $origName);
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
            } elseif ($id <= 0) {
                $error = 'Для нового тура нужно загрузить файл модели или указать имя уже загруженного файла';
            }

            if (!$error) {
                if ($id > 0) {
                    if ($filePath !== null) {
                        $stmt = $pdo->prepare(
                            'UPDATE tours SET name=:name, description=:description, lat=:lat, lon=:lon,
                                file_path=:file_path, file_format=:file_format, is_enabled=:is_enabled
                             WHERE id=:id'
                        );
                        $stmt->execute([
                            'id' => $id, 'name' => $name, 'description' => $description ?: null,
                            'lat' => $lat, 'lon' => $lon, 'file_path' => $filePath,
                            'file_format' => $fileFormat, 'is_enabled' => $isEnabled,
                        ]);
                    } else {
                        $stmt = $pdo->prepare(
                            'UPDATE tours SET name=:name, description=:description, lat=:lat, lon=:lon, is_enabled=:is_enabled
                             WHERE id=:id'
                        );
                        $stmt->execute([
                            'id' => $id, 'name' => $name, 'description' => $description ?: null,
                            'lat' => $lat, 'lon' => $lon, 'is_enabled' => $isEnabled,
                        ]);
                    }
                } else {
                    $stmt = $pdo->prepare(
                        'INSERT INTO tours (name, description, lat, lon, file_path, file_format, is_enabled, created_by)
                         VALUES (:name, :description, :lat, :lon, :file_path, :file_format, :is_enabled, :created_by)'
                    );
                    $stmt->execute([
                        'name' => $name, 'description' => $description ?: null,
                        'lat' => $lat, 'lon' => $lon, 'file_path' => $filePath,
                        'file_format' => $fileFormat, 'is_enabled' => $isEnabled,
                        'created_by' => $admin['id'],
                    ]);
                }
                header('Location: /tours.php');
                exit;
            }
        }
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $pdo->prepare('SELECT file_path FROM tours WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        if ($row && $row['file_path'] && is_file($uploadDir . $row['file_path'])) {
            unlink($uploadDir . $row['file_path']);
        }
        $pdo->prepare('DELETE FROM tours WHERE id = :id')->execute(['id' => $id]);
        header('Location: /tours.php');
        exit;
    } elseif ($action === 'sync_pg') {
        $tourId = (int)($_POST['id'] ?? 0);
        $connId = (int)($_POST['connection_id'] ?? 0);

        $tourStmt = $pdo->prepare('SELECT * FROM tours WHERE id = :id');
        $tourStmt->execute(['id' => $tourId]);
        $tour = $tourStmt->fetch();

        $connStmt = $pdo->prepare('SELECT * FROM pg_connections WHERE id = :id');
        $connStmt->execute(['id' => $connId]);
        $profile = $connStmt->fetch();

        if (!$tour || !$profile) {
            $error = 'Тур или профиль подключения не найден';
        } else {
            $localFile = $uploadDir . $tour['file_path'];
            try {
                if (!is_file($localFile)) {
                    throw new RuntimeException('Файл модели не найден на сервере: ' . $tour['file_path']);
                }

                $pgPdo = pg($profile);

                try {
                    $pgPdo->exec('CREATE EXTENSION IF NOT EXISTS postgis');
                } catch (Throwable $e) {
                    // Может не быть прав на CREATE EXTENSION — не критично, если
                    // расширение уже установлено администратором удалённой базы.
                }

                $pgPdo->exec(
                    'CREATE TABLE IF NOT EXISTS gaussian_tours (
                        id SERIAL PRIMARY KEY,
                        source_tour_id INTEGER UNIQUE,
                        name TEXT NOT NULL,
                        description TEXT,
                        geom geometry(Point, 4326) NOT NULL,
                        file_format TEXT NOT NULL,
                        model_data BYTEA NOT NULL,
                        uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
                    )'
                );

                $upsert = $pgPdo->prepare(
                    'INSERT INTO gaussian_tours (source_tour_id, name, description, geom, file_format, model_data)
                     VALUES (:source_tour_id, :name, :description, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), :file_format, :model_data)
                     ON CONFLICT (source_tour_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        geom = EXCLUDED.geom,
                        file_format = EXCLUDED.file_format,
                        model_data = EXCLUDED.model_data,
                        uploaded_at = now()'
                );
                $upsert->bindValue(':source_tour_id', $tourId, PDO::PARAM_INT);
                $upsert->bindValue(':name', $tour['name']);
                $upsert->bindValue(':description', $tour['description']);
                $upsert->bindValue(':lon', (float)$tour['lon']);
                $upsert->bindValue(':lat', (float)$tour['lat']);
                $upsert->bindValue(':file_format', $tour['file_format']);
                $stream = fopen($localFile, 'rb');
                $upsert->bindParam(':model_data', $stream, PDO::PARAM_LOB);
                $upsert->execute();
                fclose($stream);

                $pdo->prepare(
                    'UPDATE tours SET pg_connection_id = :conn_id, pg_synced_at = NOW(), pg_sync_error = NULL WHERE id = :id'
                )->execute(['conn_id' => $connId, 'id' => $tourId]);
            } catch (Throwable $e) {
                $pdo->prepare(
                    'UPDATE tours SET pg_sync_error = :error WHERE id = :id'
                )->execute(['error' => substr($e->getMessage(), 0, 255), 'id' => $tourId]);
            }
            header('Location: /tours.php');
            exit;
        }
    }
}

if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare('SELECT * FROM tours WHERE id = :id');
    $stmt->execute(['id' => (int)$_GET['edit']]);
    $edit = $stmt->fetch() ?: null;
}

$tours = $pdo->query(
    'SELECT t.*, c.name AS pg_connection_name
     FROM tours t
     LEFT JOIN pg_connections c ON c.id = t.pg_connection_id
     ORDER BY t.name'
)->fetchAll();
$pgConnections = $pdo->query('SELECT id, name FROM pg_connections ORDER BY name')->fetchAll();

$pageTitle = 'Туры (3DGS)';
$pageIcon = 'bi-camera-reels';
require __DIR__ . '/app/views/_head.php';
?>
  <?php if ($error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <div class="card surface-card mb-4">
    <div class="card-body">
      <h2 class="h6 mb-3"><?= $edit ? 'Изменить тур' : 'Добавить тур' ?></h2>
      <form method="post" action="/tours.php" enctype="multipart/form-data" class="row g-3">
        <input type="hidden" name="action" value="save">
        <input type="hidden" name="id" value="<?= (int)($edit['id'] ?? 0) ?>">

        <div class="col-md-6">
          <label class="form-label small">Название*</label>
          <input type="text" name="name" class="form-control" required value="<?= htmlspecialchars($edit['name'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-6">
          <label class="form-label small">Описание</label>
          <input type="text" name="description" class="form-control" value="<?= htmlspecialchars($edit['description'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-3">
          <label class="form-label small">Широта (lat)*</label>
          <input type="text" name="lat" class="form-control" required value="<?= htmlspecialchars((string)($edit['lat'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-3">
          <label class="form-label small">Долгота (lon)*</label>
          <input type="text" name="lon" class="form-control" required value="<?= htmlspecialchars((string)($edit['lon'] ?? ''), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-3 form-check mt-4">
          <input type="checkbox" name="is_enabled" class="form-check-input" id="isEnabled" <?= empty($edit) || !empty($edit['is_enabled']) ? 'checked' : '' ?>>
          <label class="form-check-label" for="isEnabled">Показывать на карте</label>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Файл модели (.ply / .splat / .ksplat)</label>
          <input type="file" name="model_file" class="form-control" accept=".ply,.splat,.ksplat">
          <?php if ($edit && $edit['file_path']): ?>
            <div class="form-text">Текущий файл: <?= htmlspecialchars($edit['file_path'], ENT_QUOTES, 'UTF-8') ?>. Оставьте поле пустым, чтобы не менять.</div>
          <?php endif; ?>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Или файл уже на сервере (uploads/tours/...), если залит по FTP</label>
          <input type="text" name="existing_file" class="form-control" placeholder="model.ksplat">
        </div>

        <div class="col-12 d-flex gap-2">
          <button type="submit" class="btn btn-primary"><?= $edit ? 'Сохранить' : 'Добавить' ?></button>
          <?php if ($edit): ?><a href="/tours.php" class="btn btn-outline-secondary">Отмена</a><?php endif; ?>
        </div>
      </form>
    </div>
  </div>

  <div class="card surface-card">
    <div class="card-body">
      <h2 class="h6 mb-3">Список туров</h2>
      <div class="table-responsive">
        <table class="table table-clean align-middle">
          <thead>
            <tr><th>Название</th><th>Координаты</th><th>Файл</th><th>На карте</th><th>PostGIS</th><th></th></tr>
          </thead>
          <tbody>
          <?php foreach ($tours as $t): ?>
            <tr>
              <td><?= htmlspecialchars($t['name'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($t['lat'] . ', ' . $t['lon'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($t['file_path'] ?: '—', ENT_QUOTES, 'UTF-8') ?> <span class="text-secondary small">(<?= htmlspecialchars($t['file_format'], ENT_QUOTES, 'UTF-8') ?>)</span></td>
              <td><?= $t['is_enabled'] ? '<span class="badge text-bg-success">да</span>' : '<span class="badge text-bg-secondary">нет</span>' ?></td>
              <td>
                <?php if ($t['pg_synced_at']): ?>
                  <span class="badge text-bg-success" title="<?= htmlspecialchars($t['pg_connection_name'] ?? '', ENT_QUOTES, 'UTF-8') ?>">выгружено <?= htmlspecialchars(substr($t['pg_synced_at'], 0, 16), ENT_QUOTES, 'UTF-8') ?></span>
                <?php elseif ($t['pg_sync_error']): ?>
                  <span class="badge text-bg-danger" title="<?= htmlspecialchars($t['pg_sync_error'], ENT_QUOTES, 'UTF-8') ?>">ошибка</span>
                <?php else: ?>
                  <span class="badge text-bg-secondary">не выгружено</span>
                <?php endif; ?>
                <?php if ($pgConnections && $t['file_path']): ?>
                <form method="post" action="/tours.php" class="d-flex gap-1 mt-1">
                  <input type="hidden" name="action" value="sync_pg">
                  <input type="hidden" name="id" value="<?= (int)$t['id'] ?>">
                  <select name="connection_id" class="form-select form-select-sm" style="width: auto">
                    <?php foreach ($pgConnections as $c): ?>
                      <option value="<?= (int)$c['id'] ?>" <?= (int)$t['pg_connection_id'] === (int)$c['id'] ? 'selected' : '' ?>><?= htmlspecialchars($c['name'], ENT_QUOTES, 'UTF-8') ?></option>
                    <?php endforeach; ?>
                  </select>
                  <button type="submit" class="btn btn-sm btn-outline-primary"><i class="bi bi-cloud-upload"></i></button>
                </form>
                <?php endif; ?>
              </td>
              <td class="text-end">
                <a href="/tours.php?edit=<?= (int)$t['id'] ?>" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                <form method="post" action="/tours.php" class="d-inline" onsubmit="return confirm('Удалить тур и файл модели?');">
                  <input type="hidden" name="action" value="delete">
                  <input type="hidden" name="id" value="<?= (int)$t['id'] ?>">
                  <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$tours): ?>
            <tr><td colspan="6" class="text-muted">Туров пока нет</td></tr>
          <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
<?php require __DIR__ . '/app/views/_foot.php'; ?>
