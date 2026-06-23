<?php
$__admin = current_admin();
$__role = $__admin['role'] ?? null;
$__current = basename($_SERVER['SCRIPT_NAME'] ?? '');
function nav_active(string $page, string $current): string
{
    return $page === $current ? ' active' : '';
}
?>
<aside class="sidebar" id="sidebar">
  <a class="sidebar-brand" href="/home.php">
    <i class="bi bi-broadcast-pin"></i>
    <span>GNSS Мониторинг</span>
  </a>
  <nav class="sidebar-nav">
    <a class="sidebar-link<?= nav_active('home.php', $__current) ?>" href="/home.php">
      <i class="bi bi-house"></i><span>Главная</span>
    </a>
    <a class="sidebar-link<?= nav_active('map.php', $__current) ?>" href="/map.php">
      <i class="bi bi-map"></i><span>Карта</span>
    </a>
    <?php if ($__role === 'admin'): ?>
    <a class="sidebar-link<?= nav_active('stations.php', $__current) ?>" href="/stations.php">
      <i class="bi bi-hdd-network"></i><span>Станции</span>
    </a>
    <a class="sidebar-link<?= nav_active('subscriptions.php', $__current) ?>" href="/subscriptions.php">
      <i class="bi bi-credit-card"></i><span>Подписки</span>
    </a>
    <a class="sidebar-link<?= nav_active('tours.php', $__current) ?>" href="/tours.php">
      <i class="bi bi-camera-reels"></i><span>Туры</span>
    </a>
    <a class="sidebar-link<?= nav_active('pg_connections.php', $__current) ?>" href="/pg_connections.php">
      <i class="bi bi-hdd-rack"></i><span>Подключения БД</span>
    </a>
    <a class="sidebar-link<?= nav_active('rinex_generate.php', $__current) ?>" href="/rinex_generate.php">
      <i class="bi bi-magic"></i><span>Генератор RINEX</span>
    </a>
    <div class="sidebar-group-label">Сотрудники</div>
    <a class="sidebar-link sidebar-sublink<?= nav_active('employee_invites.php', $__current) ?>" href="/employee_invites.php">
      <i class="bi bi-envelope-paper"></i><span>Приглашения</span>
    </a>
    <a class="sidebar-link sidebar-sublink<?= nav_active('employees.php', $__current) ?>" href="/employees.php">
      <i class="bi bi-people"></i><span>Список</span>
    </a>
    <?php endif; ?>
    <a class="sidebar-link<?= nav_active('rinex.php', $__current) ?>" href="/rinex.php">
      <i class="bi bi-folder2-open"></i><span>RINEX</span>
    </a>
  </nav>
</aside>
