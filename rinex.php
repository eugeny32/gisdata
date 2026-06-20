<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
$user = require_login();

$basePath = rtrim(app_config()['rinex']['base_path'], '\\/');
$basePathReal = realpath($basePath);

$relInput = (string)($_GET['path'] ?? '');
$relInput = str_replace('\\', '/', $relInput);
$relInput = trim($relInput, '/');

$targetPath = $basePathReal !== false ? $basePathReal . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relInput) : null;
$targetReal = $targetPath ? realpath($targetPath) : false;

$error = null;
$entries = [];

if ($basePathReal === false) {
    $error = 'Каталог RINEX недоступен на этом сервере: ' . $basePath;
} elseif ($targetReal === false || strncmp($targetReal, $basePathReal, strlen($basePathReal)) !== 0) {
    $error = 'Каталог не найден';
    $targetReal = $basePathReal;
    $relInput = '';
} elseif (!is_dir($targetReal)) {
    $error = 'Указанный путь не является каталогом';
    $targetReal = $basePathReal;
    $relInput = '';
}

if (!$error) {
    foreach (scandir($targetReal) as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        $full = $targetReal . DIRECTORY_SEPARATOR . $item;
        $entries[] = [
            'name' => $item,
            'is_dir' => is_dir($full),
            'size' => is_file($full) ? filesize($full) : null,
            'mtime' => date('Y-m-d H:i', filemtime($full)),
        ];
    }
    usort($entries, fn($a, $b) => $b['is_dir'] <=> $a['is_dir'] ?: strcmp($a['name'], $b['name']));
}

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

function rel_join(string $rel, string $name): string
{
    return $rel === '' ? $name : $rel . '/' . $name;
}
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>RINEX файлы</title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<?php include __DIR__ . '/app/views/_nav.php'; ?>
<main class="container">
  <h1>RINEX файлы</h1>
  <div class="breadcrumb">
    <a href="/rinex.php">2026</a>
    <?php
    $parts = $relInput !== '' ? explode('/', $relInput) : [];
    $acc = '';
    foreach ($parts as $p) {
      $acc = rel_join($acc, $p);
      echo ' / <a href="/rinex.php?path=' . htmlspecialchars(rawurlencode($acc), ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($p, ENT_QUOTES, 'UTF-8') . '</a>';
    }
    ?>
  </div>

  <?php if ($error): ?>
    <div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
  <?php else: ?>
    <table class="rinex-table">
      <thead><tr><th>Имя</th><th>Размер</th><th>Изменён</th></tr></thead>
      <tbody>
      <?php foreach ($entries as $e): ?>
        <tr>
          <td>
            <?php if ($e['is_dir']): ?>
              📁 <a href="/rinex.php?path=<?= htmlspecialchars(rawurlencode(rel_join($relInput, $e['name'])), ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($e['name'], ENT_QUOTES, 'UTF-8') ?></a>
            <?php else: ?>
              📄 <a href="/rinex_download.php?path=<?= htmlspecialchars(rawurlencode(rel_join($relInput, $e['name'])), ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($e['name'], ENT_QUOTES, 'UTF-8') ?></a>
            <?php endif; ?>
          </td>
          <td><?= human_size($e['size']) ?></td>
          <td><?= htmlspecialchars($e['mtime'], ENT_QUOTES, 'UTF-8') ?></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$entries): ?>
        <tr><td colspan="3">Папка пуста</td></tr>
      <?php endif; ?>
      </tbody>
    </table>
  <?php endif; ?>
</main>
</body>
</html>
