<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$admin = require_admin_role('admin');

$pdo = db();
$error = null;
$edit = null;
$testResult = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'save') {
        $id        = (int)($_POST['id'] ?? 0);
        $name      = trim((string)($_POST['name'] ?? ''));
        $host      = trim((string)($_POST['host'] ?? ''));
        $port      = (int)($_POST['port'] ?? 5432);
        $dbname    = trim((string)($_POST['dbname'] ?? ''));
        $username  = trim((string)($_POST['username'] ?? ''));
        $password  = (string)($_POST['password'] ?? '');
        $sslmode   = trim((string)($_POST['sslmode'] ?? 'prefer'));
        $isDefault = isset($_POST['is_default']) ? 1 : 0;

        if ($name === '' || $host === '' || $dbname === '' || $username === '' || $port <= 0) {
            $error = 'Заполните обязательные поля: название, хост, порт, база, пользователь';
        } else {
            if ($isDefault) {
                $pdo->exec('UPDATE pg_connections SET is_default = 0');
            }
            if ($id > 0) {
                if ($password !== '') {
                    $stmt = $pdo->prepare(
                        'UPDATE pg_connections SET name=:name, host=:host, port=:port, dbname=:dbname,
                            username=:username, password=:password, sslmode=:sslmode, is_default=:is_default
                         WHERE id=:id'
                    );
                    $stmt->execute([
                        'id' => $id, 'name' => $name, 'host' => $host, 'port' => $port, 'dbname' => $dbname,
                        'username' => $username, 'password' => $password, 'sslmode' => $sslmode ?: 'prefer',
                        'is_default' => $isDefault,
                    ]);
                } else {
                    $stmt = $pdo->prepare(
                        'UPDATE pg_connections SET name=:name, host=:host, port=:port, dbname=:dbname,
                            username=:username, sslmode=:sslmode, is_default=:is_default
                         WHERE id=:id'
                    );
                    $stmt->execute([
                        'id' => $id, 'name' => $name, 'host' => $host, 'port' => $port, 'dbname' => $dbname,
                        'username' => $username, 'sslmode' => $sslmode ?: 'prefer', 'is_default' => $isDefault,
                    ]);
                }
            } else {
                if ($password === '') {
                    $error = 'Укажите пароль для нового профиля';
                } else {
                    $stmt = $pdo->prepare(
                        'INSERT INTO pg_connections (name, host, port, dbname, username, password, sslmode, is_default, created_by)
                         VALUES (:name, :host, :port, :dbname, :username, :password, :sslmode, :is_default, :created_by)'
                    );
                    $stmt->execute([
                        'name' => $name, 'host' => $host, 'port' => $port, 'dbname' => $dbname,
                        'username' => $username, 'password' => $password, 'sslmode' => $sslmode ?: 'prefer',
                        'is_default' => $isDefault, 'created_by' => $admin['id'],
                    ]);
                }
            }
            if (!$error) {
                header('Location: /pg_connections.php');
                exit;
            }
        }
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $pdo->prepare('DELETE FROM pg_connections WHERE id = :id')->execute(['id' => $id]);
        header('Location: /pg_connections.php');
        exit;
    } elseif ($action === 'test') {
        $id = (int)($_POST['id'] ?? 0);
        $stmt = $pdo->prepare('SELECT * FROM pg_connections WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $profile = $stmt->fetch();
        if (!$profile) {
            $testResult = ['ok' => false, 'name' => '—', 'message' => 'Профиль не найден'];
        } else {
            try {
                $pgPdo = pg($profile);
                $pgPdo->query('SELECT 1');
                $testResult = ['ok' => true, 'name' => $profile['name'], 'message' => 'Соединение успешно установлено'];
            } catch (Throwable $e) {
                $testResult = ['ok' => false, 'name' => $profile['name'], 'message' => $e->getMessage()];
            }
        }
    }
}

if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare('SELECT * FROM pg_connections WHERE id = :id');
    $stmt->execute(['id' => (int)$_GET['edit']]);
    $edit = $stmt->fetch() ?: null;
}

$connections = $pdo->query('SELECT * FROM pg_connections ORDER BY name')->fetchAll();

$pageTitle = 'Подключения БД (PostgreSQL/PostGIS)';
$pageIcon = 'bi-hdd-rack';
require __DIR__ . '/app/views/_head.php';
?>
  <?php if ($error): ?>
    <div class="alert alert-danger"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <?php if ($testResult): ?>
    <div class="alert <?= $testResult['ok'] ? 'alert-success' : 'alert-danger' ?>">
      «<?= htmlspecialchars($testResult['name'], ENT_QUOTES, 'UTF-8') ?>»: <?= htmlspecialchars($testResult['message'], ENT_QUOTES, 'UTF-8') ?>
    </div>
  <?php endif; ?>

  <div class="card surface-card mb-4">
    <div class="card-body">
      <h2 class="h6 mb-3"><?= $edit ? 'Изменить профиль' : 'Добавить профиль подключения' ?></h2>
      <form method="post" action="/pg_connections.php" class="row g-3">
        <input type="hidden" name="action" value="save">
        <input type="hidden" name="id" value="<?= (int)($edit['id'] ?? 0) ?>">

        <div class="col-md-4">
          <label class="form-label small">Название*</label>
          <input type="text" name="name" class="form-control" required placeholder="mtccom PostGIS" value="<?= htmlspecialchars($edit['name'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-5">
          <label class="form-label small">Хост*</label>
          <input type="text" name="host" class="form-control" required placeholder="mtccom.ru" value="<?= htmlspecialchars($edit['host'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-3">
          <label class="form-label small">Порт*</label>
          <input type="number" name="port" class="form-control" required value="<?= htmlspecialchars((string)($edit['port'] ?? 5432), ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-4">
          <label class="form-label small">База данных*</label>
          <input type="text" name="dbname" class="form-control" required value="<?= htmlspecialchars($edit['dbname'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-4">
          <label class="form-label small">Пользователь*</label>
          <input type="text" name="username" class="form-control" required value="<?= htmlspecialchars($edit['username'] ?? '', ENT_QUOTES, 'UTF-8') ?>">
        </div>
        <div class="col-md-4">
          <label class="form-label small">Пароль<?= $edit ? ' (оставьте пустым, чтобы не менять)' : '*' ?></label>
          <input type="password" name="password" class="form-control">
        </div>
        <div class="col-md-3">
          <label class="form-label small">sslmode</label>
          <select name="sslmode" class="form-select">
            <?php foreach (['disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'] as $mode): ?>
              <option value="<?= $mode ?>" <?= ($edit['sslmode'] ?? 'prefer') === $mode ? 'selected' : '' ?>><?= $mode ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="col-md-3 form-check mt-4">
          <input type="checkbox" name="is_default" class="form-check-input" id="isDefault" <?= !empty($edit['is_default']) ? 'checked' : '' ?>>
          <label class="form-check-label" for="isDefault">Профиль по умолчанию</label>
        </div>

        <div class="col-12 d-flex gap-2">
          <button type="submit" class="btn btn-primary"><?= $edit ? 'Сохранить' : 'Добавить' ?></button>
          <?php if ($edit): ?><a href="/pg_connections.php" class="btn btn-outline-secondary">Отмена</a><?php endif; ?>
        </div>
      </form>
    </div>
  </div>

  <div class="card surface-card">
    <div class="card-body">
      <h2 class="h6 mb-3">Профили подключения</h2>
      <div class="table-responsive">
        <table class="table table-clean align-middle">
          <thead>
            <tr><th>Название</th><th>Хост:порт</th><th>База</th><th>Пользователь</th><th>По умолчанию</th><th></th></tr>
          </thead>
          <tbody>
          <?php foreach ($connections as $c): ?>
            <tr>
              <td><?= htmlspecialchars($c['name'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($c['host'] . ':' . $c['port'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($c['dbname'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= htmlspecialchars($c['username'], ENT_QUOTES, 'UTF-8') ?></td>
              <td><?= $c['is_default'] ? '<span class="badge text-bg-success">да</span>' : '' ?></td>
              <td class="text-end">
                <form method="post" action="/pg_connections.php" class="d-inline">
                  <input type="hidden" name="action" value="test">
                  <input type="hidden" name="id" value="<?= (int)$c['id'] ?>">
                  <button type="submit" class="btn btn-sm btn-outline-success"><i class="bi bi-plug"></i> Проверить</button>
                </form>
                <a href="/pg_connections.php?edit=<?= (int)$c['id'] ?>" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                <form method="post" action="/pg_connections.php" class="d-inline" onsubmit="return confirm('Удалить профиль подключения?');">
                  <input type="hidden" name="action" value="delete">
                  <input type="hidden" name="id" value="<?= (int)$c['id'] ?>">
                  <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$connections): ?>
            <tr><td colspan="6" class="text-muted">Профилей пока нет</td></tr>
          <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
<?php require __DIR__ . '/app/views/_foot.php'; ?>
