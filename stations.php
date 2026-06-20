<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$admin = require_admin();

$pdo = db();
$error = null;
$edit = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'save') {
        $id         = (int)($_POST['id'] ?? 0);
        $name       = trim((string)($_POST['name'] ?? ''));
        $host       = trim((string)($_POST['host'] ?? ''));
        $port       = (int)($_POST['port'] ?? 2101);
        $mount      = trim((string)($_POST['mountpoint'] ?? ''));
        $ntripUser  = trim((string)($_POST['ntrip_user'] ?? ''));
        $ntripPass  = (string)($_POST['ntrip_password'] ?? '');
        $lat        = (float)($_POST['lat'] ?? 0);
        $lon        = (float)($_POST['lon'] ?? 0);
        $rinexPath  = trim((string)($_POST['rinex_path'] ?? ''));
        $comment    = trim((string)($_POST['comment'] ?? ''));
        $isEnabled  = isset($_POST['is_enabled']) ? 1 : 0;

        if ($name === '' || $host === '' || $mount === '' || $port <= 0) {
            $error = 'Заполните обязательные поля: название, хост, порт, точка подключения (mountpoint)';
        } else {
            if ($id > 0) {
                $stmt = $pdo->prepare(
                    'UPDATE stations SET name=:name, host=:host, port=:port, mountpoint=:mountpoint,
                        ntrip_user=:ntrip_user, ntrip_password=:ntrip_password, lat=:lat, lon=:lon,
                        rinex_path=:rinex_path, comment=:comment, is_enabled=:is_enabled
                     WHERE id=:id'
                );
                $stmt->execute([
                    'id' => $id, 'name' => $name, 'host' => $host, 'port' => $port, 'mountpoint' => $mount,
                    'ntrip_user' => $ntripUser ?: null, 'ntrip_password' => $ntripPass ?: null,
                    'lat' => $lat, 'lon' => $lon, 'rinex_path' => $rinexPath ?: null,
                    'comment' => $comment ?: null, 'is_enabled' => $isEnabled,
                ]);
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO stations (name, host, port, mountpoint, ntrip_user, ntrip_password, lat, lon, rinex_path, comment, is_enabled)
                     VALUES (:name, :host, :port, :mountpoint, :ntrip_user, :ntrip_password, :lat, :lon, :rinex_path, :comment, :is_enabled)'
                );
                $stmt->execute([
                    'name' => $name, 'host' => $host, 'port' => $port, 'mountpoint' => $mount,
                    'ntrip_user' => $ntripUser ?: null, 'ntrip_password' => $ntripPass ?: null,
                    'lat' => $lat, 'lon' => $lon, 'rinex_path' => $rinexPath ?: null,
                    'comment' => $comment ?: null, 'is_enabled' => $isEnabled,
                ]);
                $newId = (int)$pdo->lastInsertId();
                $pdo->prepare('INSERT INTO station_status (station_id, status) VALUES (:id, "unknown")')
                    ->execute(['id' => $newId]);
            }
            header('Location: /stations.php');
            exit;
        }
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $pdo->prepare('DELETE FROM stations WHERE id = :id')->execute(['id' => $id]);
        header('Location: /stations.php');
        exit;
    }
}

if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare('SELECT * FROM stations WHERE id = :id');
    $stmt->execute(['id' => (int)$_GET['edit']]);
    $edit = $stmt->fetch() ?: null;
}

$stations = $pdo->query(
    'SELECT s.*, st.status, st.last_check_at, st.last_data_at
     FROM stations s LEFT JOIN station_status st ON st.station_id = s.id
     ORDER BY s.name'
)->fetchAll();
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Базовые станции — администрирование</title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<?php include __DIR__ . '/app/views/_nav.php'; ?>
<main class="container">
  <h1>Базовые станции</h1>

  <?php if ($error): ?>
    <div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif; ?>

  <h2><?= $edit ? 'Изменить станцию' : 'Добавить станцию' ?></h2>
  <form method="post" action="/stations.php" class="station-form">
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="id" value="<?= (int)($edit['id'] ?? 0) ?>">

    <label>Название*<input type="text" name="name" required value="<?= htmlspecialchars($edit['name'] ?? '', ENT_QUOTES, 'UTF-8') ?>"></label>
    <label>Хост (IP/домен)*<input type="text" name="host" required value="<?= htmlspecialchars($edit['host'] ?? '', ENT_QUOTES, 'UTF-8') ?>"></label>
    <label>Порт*<input type="number" name="port" required value="<?= htmlspecialchars((string)($edit['port'] ?? 2101), ENT_QUOTES, 'UTF-8') ?>"></label>
    <label>Mountpoint*<input type="text" name="mountpoint" required value="<?= htmlspecialchars($edit['mountpoint'] ?? '', ENT_QUOTES, 'UTF-8') ?>"></label>
    <label>NTRIP логин<input type="text" name="ntrip_user" value="<?= htmlspecialchars($edit['ntrip_user'] ?? '', ENT_QUOTES, 'UTF-8') ?>"></label>
    <label>NTRIP пароль<input type="password" name="ntrip_password" value="<?= htmlspecialchars($edit['ntrip_password'] ?? '', ENT_QUOTES, 'UTF-8') ?>"></label>
    <label>Широта (lat)*<input type="text" name="lat" required value="<?= htmlspecialchars((string)($edit['lat'] ?? ''), ENT_QUOTES, 'UTF-8') ?>"></label>
    <label>Долгота (lon)*<input type="text" name="lon" required value="<?= htmlspecialchars((string)($edit['lon'] ?? ''), ENT_QUOTES, 'UTF-8') ?>"></label>
    <label>Подпапка RINEX (внутри E:\Ftp\RINEX\RINEX\2026)<input type="text" name="rinex_path" value="<?= htmlspecialchars($edit['rinex_path'] ?? '', ENT_QUOTES, 'UTF-8') ?>"></label>
    <label>Комментарий<input type="text" name="comment" value="<?= htmlspecialchars($edit['comment'] ?? '', ENT_QUOTES, 'UTF-8') ?>"></label>
    <label class="checkbox"><input type="checkbox" name="is_enabled" <?= empty($edit) || !empty($edit['is_enabled']) ? 'checked' : '' ?>> Включена (опрашивать статус)</label>

    <button type="submit"><?= $edit ? 'Сохранить' : 'Добавить' ?></button>
    <?php if ($edit): ?><a href="/stations.php">Отмена</a><?php endif; ?>
  </form>

  <h2>Список станций</h2>
  <table class="stations-table">
    <thead>
      <tr><th>Название</th><th>Хост:порт</th><th>Mount</th><th>Статус</th><th>Последняя проверка</th><th></th></tr>
    </thead>
    <tbody>
    <?php foreach ($stations as $s): ?>
      <tr>
        <td><?= htmlspecialchars($s['name'], ENT_QUOTES, 'UTF-8') ?></td>
        <td><?= htmlspecialchars($s['host'] . ':' . $s['port'], ENT_QUOTES, 'UTF-8') ?></td>
        <td><?= htmlspecialchars($s['mountpoint'], ENT_QUOTES, 'UTF-8') ?></td>
        <td><span class="status-pill status-<?= htmlspecialchars($s['status'] ?? 'unknown', ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($s['status'] ?? 'unknown', ENT_QUOTES, 'UTF-8') ?></span></td>
        <td><?= htmlspecialchars($s['last_check_at'] ?? '—', ENT_QUOTES, 'UTF-8') ?></td>
        <td>
          <a href="/stations.php?edit=<?= (int)$s['id'] ?>">изменить</a>
          <form method="post" action="/stations.php" style="display:inline" onsubmit="return confirm('Удалить станцию?');">
            <input type="hidden" name="action" value="delete">
            <input type="hidden" name="id" value="<?= (int)$s['id'] ?>">
            <button type="submit" class="link-btn">удалить</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
</main>
</body>
</html>
