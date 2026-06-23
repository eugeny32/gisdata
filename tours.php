<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$admin = require_admin_role('admin');

$pdo = db();
$error = null;
$edit = null;

$uploadDir = __DIR__ . '/uploads/tours/';
$allowedExt = ['ply', 'splat', 'ksplat', 'las'];

/**
 * Загрузка файла в PostgreSQL Large Object по кусочкам (4 МБ за раз) —
 * в отличие от bytea (жёсткий лимит 1 ГБ на значение в Postgres) и от
 * bindParam(..., PDO::PARAM_LOB) с bytea (который на деле буферизует весь
 * файл в памяти PHP перед отправкой), у Large Object нет лимита на размер
 * и нет необходимости держать файл в памяти целиком. Должно вызываться
 * внутри активной транзакции ($pgPdo->beginTransaction()) — это требование
 * самого Postgres для работы с large object API. Возвращает oid объекта.
 */
function pg_upload_large_object(PDO $pgPdo, string $localFile): int
{
    $oid = $pgPdo->pgsqlLOBCreate();
    $lobStream = $pgPdo->pgsqlLOBOpen($oid, 'w');
    $src = fopen($localFile, 'rb');
    while (!feof($src)) {
        fwrite($lobStream, fread($src, 4 * 1024 * 1024));
    }
    fclose($src);
    fclose($lobStream);
    return (int)$oid;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Если размер запроса превышает post_max_size, PHP молча обнуляет $_POST
    // и $_FILES ещё до старта скрипта (Content-Length при этом известен) —
    // без этой проверки форма выглядит так, будто "просто ничего не делает",
    // без единой ошибки. Для файлов в единицы/десятки ГБ (большие .las) это
    // и есть типичная причина "не загружает".
    $contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 0 && empty($_POST) && empty($_FILES)) {
        $postMaxSize = ini_get('post_max_size');
        $uploadMaxFilesize = ini_get('upload_max_filesize');
        $error = "Файл слишком большой для загрузки через форму (лимит хостинга post_max_size={$postMaxSize}, upload_max_filesize={$uploadMaxFilesize}). " .
            'Залейте файл по FTP в uploads/tours/ и укажите его имя в поле «Или файл(ы) уже на сервере» вместо выбора файла. ' .
            'Если лимит хостинга позволяет, но загрузка всё равно не идёт — лимит может стоять и на уровне веб-сервера (nginx client_max_body_size/Apache LimitRequestBody), это не правится из кода приложения.';
    }

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
            // Собираем список загружаемых файлов: либо через форму (несколько
            // файлов одного скана), либо именами уже залитых по FTP (по одному
            // на строку в поле "Файл(ы) уже на сервере").
            $newFiles = []; // [['file_path' => ..., 'file_format' => ...], ...]

            $uploadedNames = $_FILES['model_files']['name'] ?? [];
            $hasUpload = is_array($uploadedNames) && array_filter($uploadedNames);

            if ($hasUpload) {
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                foreach ($uploadedNames as $i => $origName) {
                    if ($origName === '') {
                        continue;
                    }
                    $ext = strtolower(pathinfo((string)$origName, PATHINFO_EXTENSION));
                    if (!in_array($ext, $allowedExt, true)) {
                        $error = 'Недопустимый формат файла "' . $origName . '". Разрешено: ' . implode(', ', $allowedExt);
                        break;
                    }
                    if ($_FILES['model_files']['error'][$i] !== UPLOAD_ERR_OK) {
                        $error = 'Ошибка загрузки файла "' . $origName . '" (код ' . $_FILES['model_files']['error'][$i] . '). Возможно, превышен лимит хостинга (upload_max_filesize/post_max_size) — для крупных моделей залейте файлы по FTP и укажите их имена в поле «Файл(ы) уже на сервере».';
                        break;
                    }
                    $storedName = uniqid('tour_', true) . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', (string)$origName);
                    if (!move_uploaded_file($_FILES['model_files']['tmp_name'][$i], $uploadDir . $storedName)) {
                        $error = 'Не удалось сохранить загруженный файл "' . $origName . '" на сервере';
                        break;
                    }
                    $newFiles[] = ['file_path' => $storedName, 'file_format' => $ext];
                }
            } elseif ($existingFileName !== '') {
                foreach (preg_split('/[\r\n]+/', $existingFileName, -1, PREG_SPLIT_NO_EMPTY) as $name1) {
                    $name1 = trim($name1);
                    $ext = strtolower(pathinfo($name1, PATHINFO_EXTENSION));
                    if (!in_array($ext, $allowedExt, true)) {
                        $error = 'Недопустимый формат файла "' . $name1 . '". Разрешено: ' . implode(', ', $allowedExt);
                        break;
                    }
                    if (!is_file($uploadDir . $name1)) {
                        $error = 'Файл "' . $name1 . '" не найден в uploads/tours/ на сервере';
                        break;
                    }
                    $newFiles[] = ['file_path' => $name1, 'file_format' => $ext];
                }
            } elseif ($id <= 0) {
                $error = 'Для нового тура нужно загрузить файл(ы) модели или указать имена уже загруженных файлов';
            }

            if (!$error) {
                $filePath = $newFiles ? $newFiles[0]['file_path'] : null;
                $fileFormat = $newFiles ? $newFiles[0]['file_format'] : null;
                $extraFiles = $newFiles ? array_slice($newFiles, 1) : [];

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
                        // Новый набор файлов полностью заменяет старые доп. файлы тура.
                        $pdo->prepare('DELETE FROM tour_files WHERE tour_id = :id')->execute(['id' => $id]);
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
                    $tourId = $id;
                } else {
                    $stmt = $pdo->prepare(
                        'INSERT INTO tours (name, description, lat, lon, file_path, file_format, is_enabled, created_by)
                         VALUES (:name, :description, :lat, :lon, :file_path, :file_format, :is_enabled, :created_by)
                         RETURNING id'
                    );
                    $stmt->execute([
                        'name' => $name, 'description' => $description ?: null,
                        'lat' => $lat, 'lon' => $lon, 'file_path' => $filePath,
                        'file_format' => $fileFormat, 'is_enabled' => $isEnabled,
                        'created_by' => $admin['id'],
                    ]);
                    $tourId = (int)$stmt->fetchColumn();
                }

                if ($extraFiles) {
                    $insertExtra = $pdo->prepare(
                        'INSERT INTO tour_files (tour_id, file_path, file_format, sort_order) VALUES (:tour_id, :file_path, :file_format, :sort_order)'
                    );
                    foreach ($extraFiles as $i => $f) {
                        $insertExtra->execute([
                            'tour_id' => $tourId, 'file_path' => $f['file_path'],
                            'file_format' => $f['file_format'], 'sort_order' => $i,
                        ]);
                    }
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
        $extraStmt = $pdo->prepare('SELECT file_path FROM tour_files WHERE tour_id = :id');
        $extraStmt->execute(['id' => $id]);
        foreach ($extraStmt->fetchAll() as $extra) {
            if ($extra['file_path'] && is_file($uploadDir . $extra['file_path'])) {
                unlink($uploadDir . $extra['file_path']);
            }
        }
        $pdo->prepare('DELETE FROM tours WHERE id = :id')->execute(['id' => $id]); // tour_files удалятся каскадом (ON DELETE CASCADE)
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
            // Выгрузка крупных моделей (единицы ГБ) по сети может занимать дольше,
            // чем стандартный max_execution_time из php.ini (вне зависимости от
            // того, какой именно php.ini подхватывает Apache) — снимаем лимит
            // прямо в коде на время этого действия.
            set_time_limit(0);
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

                // model_oid — Large Object (см. pg_upload_large_object выше).
                // У bytea жёсткий лимит 1 ГБ на значение, у Large Object его нет.
                // ADD COLUMN IF NOT EXISTS/DROP NOT NULL — на случай, если таблица
                // уже существует со старой структурой (bytea model_data NOT NULL).
                $pgPdo->exec(
                    'CREATE TABLE IF NOT EXISTS gaussian_tours (
                        id SERIAL PRIMARY KEY,
                        source_tour_id INTEGER UNIQUE,
                        name TEXT NOT NULL,
                        description TEXT,
                        geom geometry(Point, 4326) NOT NULL,
                        file_format TEXT NOT NULL,
                        model_oid OID,
                        uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
                    )'
                );
                $pgPdo->exec('ALTER TABLE gaussian_tours ADD COLUMN IF NOT EXISTS model_oid OID');
                try {
                    $pgPdo->exec('ALTER TABLE gaussian_tours ALTER COLUMN model_data DROP NOT NULL');
                } catch (Throwable $e) {
                    // У свежих таблиц колонки model_data вообще нет — это ожидаемо.
                }

                // Large object API требует активной транзакции в Postgres.
                $pgPdo->beginTransaction();
                try {
                    $oldRowStmt = $pgPdo->prepare('SELECT id, model_oid FROM gaussian_tours WHERE source_tour_id = :id');
                    $oldRowStmt->execute(['id' => $tourId]);
                    $oldRow = $oldRowStmt->fetch();

                    $mainOid = pg_upload_large_object($pgPdo, $localFile);

                    $upsert = $pgPdo->prepare(
                        'INSERT INTO gaussian_tours (source_tour_id, name, description, geom, file_format, model_oid)
                         VALUES (:source_tour_id, :name, :description, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), :file_format, :model_oid)
                         ON CONFLICT (source_tour_id) DO UPDATE SET
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            geom = EXCLUDED.geom,
                            file_format = EXCLUDED.file_format,
                            model_oid = EXCLUDED.model_oid,
                            uploaded_at = now()
                         RETURNING id'
                    );
                    $upsert->execute([
                        'source_tour_id' => $tourId,
                        'name' => $tour['name'],
                        'description' => $tour['description'],
                        'lon' => (float)$tour['lon'],
                        'lat' => (float)$tour['lat'],
                        'file_format' => $tour['file_format'],
                        'model_oid' => $mainOid,
                    ]);
                    $gaussianTourId = (int)$upsert->fetchColumn();

                    // Старый large object (от предыдущей синхронизации) больше не
                    // нужен — без unlink он навсегда останется висеть в базе.
                    if ($oldRow && $oldRow['model_oid'] && (int)$oldRow['model_oid'] !== $mainOid) {
                        try {
                            $pgPdo->pgsqlLOBUnlink((int)$oldRow['model_oid']);
                        } catch (Throwable $e) { /* noop */ }
                    }

                    // Дополнительные части модели (tour_files) — если они есть,
                    // выгружаем каждую как отдельный Large Object, привязанный к
                    // той же записи gaussian_tours. При повторной синхронизации
                    // старые части полностью заменяются (unlink + DELETE + заново).
                    $partsStmt = $pdo->prepare('SELECT file_path, file_format, sort_order FROM tour_files WHERE tour_id = :id ORDER BY sort_order');
                    $partsStmt->execute(['id' => $tourId]);
                    $parts = $partsStmt->fetchAll();

                    if ($parts) {
                        $pgPdo->exec(
                            'CREATE TABLE IF NOT EXISTS gaussian_tour_parts (
                                id SERIAL PRIMARY KEY,
                                gaussian_tour_id INTEGER NOT NULL REFERENCES gaussian_tours(id) ON DELETE CASCADE,
                                sort_order INTEGER NOT NULL DEFAULT 0,
                                file_format TEXT NOT NULL,
                                model_oid OID
                            )'
                        );
                        $pgPdo->exec('ALTER TABLE gaussian_tour_parts ADD COLUMN IF NOT EXISTS model_oid OID');
                        try {
                            $pgPdo->exec('ALTER TABLE gaussian_tour_parts ALTER COLUMN model_data DROP NOT NULL');
                        } catch (Throwable $e) { /* колонки model_data может не быть — это ожидаемо */ }

                        $oldPartOids = $pgPdo->prepare('SELECT model_oid FROM gaussian_tour_parts WHERE gaussian_tour_id = :id');
                        $oldPartOids->execute(['id' => $gaussianTourId]);
                        foreach ($oldPartOids->fetchAll(PDO::FETCH_COLUMN) as $oldOid) {
                            if ($oldOid) {
                                try {
                                    $pgPdo->pgsqlLOBUnlink((int)$oldOid);
                                } catch (Throwable $e) { /* noop */ }
                            }
                        }
                        $pgPdo->prepare('DELETE FROM gaussian_tour_parts WHERE gaussian_tour_id = :id')
                            ->execute(['id' => $gaussianTourId]);

                        $insertPart = $pgPdo->prepare(
                            'INSERT INTO gaussian_tour_parts (gaussian_tour_id, sort_order, file_format, model_oid)
                             VALUES (:gaussian_tour_id, :sort_order, :file_format, :model_oid)'
                        );
                        foreach ($parts as $part) {
                            $partFile = $uploadDir . $part['file_path'];
                            if (!is_file($partFile)) {
                                continue; // пропускаем недостающий файл, не валим всю синхронизацию
                            }
                            $partOid = pg_upload_large_object($pgPdo, $partFile);
                            $insertPart->execute([
                                'gaussian_tour_id' => $gaussianTourId,
                                'sort_order' => (int)$part['sort_order'],
                                'file_format' => $part['file_format'],
                                'model_oid' => $partOid,
                            ]);
                        }
                    }

                    $pgPdo->commit();
                } catch (Throwable $e) {
                    $pgPdo->rollBack();
                    throw $e;
                }

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

$editExtraCount = 0;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare('SELECT * FROM tours WHERE id = :id');
    $stmt->execute(['id' => (int)$_GET['edit']]);
    $edit = $stmt->fetch() ?: null;
    if ($edit) {
        $cntStmt = $pdo->prepare('SELECT COUNT(*) FROM tour_files WHERE tour_id = :id');
        $cntStmt->execute(['id' => $edit['id']]);
        $editExtraCount = (int)$cntStmt->fetchColumn();
    }
}

$tours = $pdo->query(
    'SELECT t.*, c.name AS pg_connection_name,
            (SELECT COUNT(*) FROM tour_files tf WHERE tf.tour_id = t.id) AS extra_files_count
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
      <form method="post" action="/tours.php" enctype="multipart/form-data" class="row g-3" id="tourForm">
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
          <label class="form-label small">Файл(ы) модели (.ply / .splat / .ksplat — 3DGS, или .las — облако точек LiDAR)</label>
          <input type="file" name="model_files[]" class="form-control" accept=".ply,.splat,.ksplat,.las" multiple>
          <div class="form-text">Если модель состоит из нескольких кусков одного скана в общей системе координат — выберите все файлы сразу, они будут показаны в туре одновременно. <strong>.las</strong> — пока только хранение/выгрузка в PostGIS, 3D-просмотр облака точек на карте ещё не реализован (для .ply/.splat/.ksplat просмотр работает).</div>
          <?php if ($edit && $edit['file_path']): ?>
            <div class="form-text">
              Текущие файлы: <?= htmlspecialchars($edit['file_path'], ENT_QUOTES, 'UTF-8') ?><?= $editExtraCount ? ' + ещё ' . $editExtraCount : '' ?>.
              Оставьте поле пустым, чтобы не менять.
            </div>
          <?php endif; ?>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Или файл(ы) уже на сервере (uploads/tours/...), если залиты по FTP — по одному имени на строку</label>
          <textarea name="existing_file" class="form-control" rows="3" placeholder="model_part1.ply&#10;model_part2.ply"></textarea>
        </div>

        <div class="col-12 d-none" id="tourUploadProgressWrap">
          <div class="progress" style="height: 22px">
            <div class="progress-bar" id="tourUploadProgressBar" role="progressbar" style="width: 0%">0%</div>
          </div>
        </div>
        <div class="col-12 d-flex gap-2">
          <button type="submit" class="btn btn-primary" id="tourFormSubmit"><?= $edit ? 'Сохранить' : 'Добавить' ?></button>
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
              <td>
                <?php if ($t['file_format'] === 'las'): ?>
                  <span class="badge text-bg-info">Point Cloud</span>
                <?php else: ?>
                  <span class="badge text-bg-primary">3DGS Splat</span>
                <?php endif; ?>
                <?= htmlspecialchars($t['file_path'] ?: '—', ENT_QUOTES, 'UTF-8') ?>
                <span class="text-secondary small">(<?= htmlspecialchars($t['file_format'], ENT_QUOTES, 'UTF-8') ?>)</span>
                <?php if ((int)$t['extra_files_count'] > 0): ?>
                  <span class="badge text-bg-secondary">+<?= (int)$t['extra_files_count'] ?></span>
                <?php endif; ?>
              </td>
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
                <!-- Кнопка отправки формы вынесена в общую группу кнопок
                     справа (атрибут form= — позволяет кнопке быть вне
                     формы и всё равно её отправлять), здесь остаётся
                     только выбор подключения + прогресс-бар выгрузки. -->
                <form method="post" action="/tours.php" id="syncPgForm<?= (int)$t['id'] ?>" class="sync-pg-form d-flex gap-1 mt-1">
                  <input type="hidden" name="action" value="sync_pg">
                  <input type="hidden" name="id" value="<?= (int)$t['id'] ?>">
                  <select name="connection_id" class="form-select form-select-sm" style="width: auto">
                    <?php foreach ($pgConnections as $c): ?>
                      <option value="<?= (int)$c['id'] ?>" <?= (int)$t['pg_connection_id'] === (int)$c['id'] ? 'selected' : '' ?>><?= htmlspecialchars($c['name'], ENT_QUOTES, 'UTF-8') ?></option>
                    <?php endforeach; ?>
                  </select>
                </form>
                <div class="progress mt-1 d-none sync-pg-progress" style="height: 4px; width: 140px">
                  <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
                </div>
                <?php endif; ?>
              </td>
              <td class="text-end">
                <?php if ($pgConnections && $t['file_path']): ?>
                  <button type="submit" form="syncPgForm<?= (int)$t['id'] ?>" class="btn btn-sm btn-outline-primary" title="Выгрузить в PostGIS"><i class="bi bi-cloud-upload"></i></button>
                <?php endif; ?>
                <a href="/tour_files.php?tour_id=<?= (int)$t['id'] ?>" class="btn btn-sm btn-outline-secondary" title="Доп. файлы (части модели)"><i class="bi bi-stack"></i></a>
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
<?php
$extraScripts = <<<'HTML'
<script>
// Обычная HTML-форма не показывает прогресс загрузки файла вообще — браузер
// просто "висит" до конца запроса. Перехватываем submit и шлём через XHR,
// чтобы получить реальный прогресс (xhr.upload.onprogress), а результат
// (успех/ошибка валидации) показываем, заменив документ ответом сервера —
// он всё равно отдаёт ту же полноценную HTML-страницу.
(function () {
  const form = document.getElementById('tourForm');
  if (!form) return;
  const wrap = document.getElementById('tourUploadProgressWrap');
  const bar = document.getElementById('tourUploadProgressBar');
  const submitBtn = document.getElementById('tourFormSubmit');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submitBtn.disabled = true;
    wrap.classList.remove('d-none');
    bar.style.width = '0%';
    bar.textContent = '0%';

    // form.action может вернуть сам DOM-элемент <input name="action">
    // (он же есть в этой форме), а не строку URL — именно так и получился
    // запрос на буквальный "[object HTMLInputElement]" → 404. getAttribute
    // всегда отдаёт значение атрибута как текст, независимо от того, что
    // в форме есть поле с тем же именем.
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

    // Если файл не выбран, поле <input type="file"> всё равно попадает в
    // FormData как пустая часть multipart-тела (filename="", 0 байт) — на
    // некоторых хостингах (nginx/ModSecurity) это вызывает 404 на весь
    // запрос. Просто не отправляем такие пустые файловые поля.
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

// Выгрузка в PostGIS — это не загрузка файла из браузера, а сервер сам
// читает локальный файл и пишет его в удалённый Postgres (Large Object) —
// реального процента браузер тут получить не может (тело самого POST-запроса
// от формы крошечное, в нём только id/connection_id). Поэтому при отправке
// просто показываем анимированный индикатор активности и блокируем кнопку —
// чтобы было видно, что выгрузка идёт, а не страница "повисла", без
// заявления точного процента.
document.querySelectorAll('.sync-pg-form').forEach(function (form) {
  form.addEventListener('submit', function () {
    // Кнопку отключаем (она вне формы, через form=, на отправляемые данные
    // это не влияет), а <select> — НЕ трогаем: отключённые поля браузер не
    // включает в отправляемые данные формы, иначе connection_id потерялся
    // бы прямо в момент отправки.
    const progress = form.closest('td').querySelector('.sync-pg-progress');
    const btn = document.querySelector('button[form="' + form.id + '"]');
    if (progress) progress.classList.remove('d-none');
    if (btn) btn.disabled = true;
  });
});
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';

