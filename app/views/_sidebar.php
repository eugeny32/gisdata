<?php
$__admin = current_admin();
$__role = $__admin['role'] ?? null;
$__current = basename($_SERVER['SCRIPT_NAME'] ?? '');
function nav_active(string $page, string $current): string
{
    return $page === $current ? ' active' : '';
}
// FACADE·CAD/TOPO·CAD/FACADE·FOTO для обычных (не-админ) пользователей —
// по отдельным услугам facade_cad_enabled/topo_cad_enabled/
// facade_foto_enabled (см. users.php, facade_cad.php, topo_cad.php,
// facade_foto.php). Админам инструменты видны ниже безусловно, эта
// проверка их не касается.
$__facadeCadForUser = false;
$__topoCadForUser = false;
$__facadeFotoForUser = false;
if (!$__admin) {
    $__u = current_user();
    if ($__u) {
        $__stmt = db()->prepare('SELECT facade_cad_enabled, topo_cad_enabled, facade_foto_enabled FROM users_sync WHERE id = :id');
        $__stmt->execute(['id' => $__u['id']]);
        $__flags = $__stmt->fetch();
        $__facadeCadForUser = (bool)($__flags['facade_cad_enabled'] ?? false);
        $__topoCadForUser = (bool)($__flags['topo_cad_enabled'] ?? false);
        $__facadeFotoForUser = (bool)($__flags['facade_foto_enabled'] ?? false);
    }
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
    <a class="sidebar-link<?= nav_active('my_tours.php', $__current) ?>" href="/my_tours.php">
      <i class="bi bi-camera-reels"></i><span>Мои туры</span>
    </a>
    <?php if ($__facadeCadForUser): ?>
    <a class="sidebar-link<?= nav_active('facade_cad.php', $__current) ?>" href="/facade_cad.php">
      <i class="bi bi-rulers"></i><span>FACADE·CAD</span>
    </a>
    <?php endif; ?>
    <?php if ($__topoCadForUser): ?>
    <a class="sidebar-link<?= nav_active('topo_cad.php', $__current) ?>" href="/topo_cad.php">
      <i class="bi bi-signpost-2"></i><span>TOPO·CAD</span>
    </a>
    <?php endif; ?>
    <?php if ($__facadeFotoForUser): ?>
    <a class="sidebar-link<?= nav_active('facade_foto.php', $__current) ?>" href="/facade_foto.php">
      <i class="bi bi-image"></i><span>FACADE·FOTO</span>
    </a>
    <?php endif; ?>
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
    <a class="sidebar-link<?= nav_active('slam_projects.php', $__current) ?><?= nav_active('slam_scans.php', $__current) ?>" href="/slam_projects.php">
      <i class="bi bi-radar"></i><span>SLAM (S20)</span>
    </a>
    <div class="sidebar-group-label">Инструменты</div>
    <a class="sidebar-link sidebar-sublink<?= nav_active('facade_cad.php', $__current) ?>" href="/facade_cad.php">
      <i class="bi bi-rulers"></i><span>FACADE·CAD</span>
    </a>
    <a class="sidebar-link sidebar-sublink<?= nav_active('topo_cad.php', $__current) ?>" href="/topo_cad.php">
      <i class="bi bi-signpost-2"></i><span>TOPO·CAD</span>
    </a>
    <a class="sidebar-link sidebar-sublink<?= nav_active('facade_foto.php', $__current) ?>" href="/facade_foto.php">
      <i class="bi bi-image"></i><span>FACADE·FOTO</span>
    </a>
    <a class="sidebar-link sidebar-sublink<?= nav_active('tile_layout.php', $__current) ?>" href="/tile_layout.php">
      <i class="bi bi-grid-3x3-gap-fill"></i><span>Раскладка плитки</span>
    </a>
    <a class="sidebar-link sidebar-sublink<?= nav_active('ctfadmin.php', $__current) ?>" href="/ctfadmin.php">
      <i class="bi bi-eye"></i><span>CtF·ADMIN</span>
    </a>
    <a class="sidebar-link<?= nav_active('users.php', $__current) ?>" href="/users.php">
      <i class="bi bi-people-fill"></i><span>Пользователи</span>
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
    <a class="sidebar-link sidebar-sublink<?= nav_active('rinex_requests.php', $__current) ?>" href="/rinex_requests.php">
      <i class="bi bi-clock-history"></i><span>Готовые данные</span>
    </a>
  </nav>
</aside>
