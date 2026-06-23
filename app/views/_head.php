<?php
/**
 * Общая обёртка страниц кабинета. Перед include нужно задать:
 *   $pageTitle  — заголовок <title> и <h1>
 *   $pageIcon   — класс bootstrap-icons (например 'bi-map'), опционально
 * Парная закрывающая часть — app/views/_foot.php.
 */
$pageIcon = $pageIcon ?? 'bi-house';
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($pageTitle ?? 'GNSS Мониторинг', ENT_QUOTES, 'UTF-8') ?></title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#2f6fed">
  <link rel="icon" href="/assets/icon-192.png">
  <link rel="apple-touch-icon" href="/assets/icon-192.png">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">
  <link rel="stylesheet" href="/assets/style.css">
  <script>
    (function () {
      var saved = localStorage.getItem('theme');
      document.documentElement.setAttribute('data-bs-theme', saved === 'light' ? 'light' : 'dark');
    })();
    // Service worker — обязателен Chrome для критерия "приложение можно
    // установить" (манифест сам по себе недостаточен). Регистрация работает
    // только по HTTPS (или localhost) — на обычном http:// браузер её просто
    // молча проигнорирует, кнопки "Установить" не будет.
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () { /* noop */ });
      });
    }
  </script>
</head>
<body>
<div class="app-shell">
  <?php include __DIR__ . '/_sidebar.php'; ?>
  <div class="app-content">
    <header class="topbar">
      <button class="btn btn-sm btn-outline-secondary d-lg-none" type="button" id="sidebarToggle">
        <i class="bi bi-list"></i>
      </button>
      <span class="spacer"></span>
      <button class="btn btn-sm btn-outline-secondary" type="button" id="themeToggle" title="Светлая/тёмная тема">
        <i class="bi bi-moon-stars"></i>
      </button>
      <?php $__a = current_admin(); $__u = current_user(); ?>
      <?php if ($__a): ?>
        <span class="text-secondary small ms-2"><i class="bi bi-shield-lock me-1"></i><?= htmlspecialchars($__a['login'], ENT_QUOTES, 'UTF-8') ?></span>
        <a class="btn btn-sm btn-outline-light ms-2" href="/logout.php">Выход</a>
      <?php elseif ($__u): ?>
        <span class="text-secondary small ms-2"><i class="bi bi-person me-1"></i><?= htmlspecialchars($__u['name'], ENT_QUOTES, 'UTF-8') ?></span>
        <a class="btn btn-sm btn-outline-secondary ms-2" href="/admin_login.php">Вход суперпользователя</a>
        <a class="btn btn-sm btn-outline-light ms-2" href="/logout.php">Выход</a>
      <?php endif; ?>
    </header>
    <main class="page-main">
      <h1 class="page-title h4"><i class="bi <?= htmlspecialchars($pageIcon, ENT_QUOTES, 'UTF-8') ?> text-primary"></i><?= htmlspecialchars($pageTitle ?? '', ENT_QUOTES, 'UTF-8') ?></h1>
