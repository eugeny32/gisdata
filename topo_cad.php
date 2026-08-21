<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';

/**
 * TOPO·CAD — второй веб-CAD инструмент того же вендора/движка, что
 * FACADE·CAD (github.com/skandmataisabella1357-beep/CtF, папка CtFT/,
 * реальное имя проекта TOPO·CAD) — черчение топоплана/осей поверх облака
 * точек, а не фасадов. Исходники — facade-cad/topo-cad/ (вложен внутрь
 * facade-cad/, т.к. резолвит node_modules из родительской папки — своего
 * npm-проекта с зависимостями у него нет, см. facade-cad/topo-cad/README.md),
 * собирается через vite build прямо в assets/topo-cad/ (см.
 * facade-cad/topo-cad/vite.config.ts). Грузится через iframe по тем же
 * причинам, что и FACADE·CAD (собственный Tailwind-HTML, риск конфликта
 * классов с Bootstrap). Рабочее состояние (слои/геометрия/оси) сохраняется
 * через api/topo_cad_session.php (Postgres/PostGIS) — импорт облака
 * (LAS/LAZ/E57/XYZ) остаётся локальным, через системный диалог выбора файла.
 *
 * Доступ: админам — всегда; обычным пользователям — только если у них
 * включена услуга TOPO·CAD (users_sync.topo_cad_enabled, см. users.php) —
 * отдельная от facade_cad_enabled услуга, они переключаются независимо.
 * Та же проверка повторяется в api/topo_cad_session.php на каждый запрос.
 */
require_login(); // админ ИЛИ обычный пользователь — раздел ниже сам решает, кому что
$admin = current_admin();
$user = current_user();
if (!$admin) {
    $pdo = db();
    $chk = $pdo->prepare('SELECT topo_cad_enabled FROM users_sync WHERE id = :id');
    $chk->execute(['id' => $user['id']]);
    if (!(int)$chk->fetchColumn()) {
        http_response_code(403);
        exit('403 Forbidden: услуга TOPO·CAD не подключена для вашего аккаунта — обратитесь к администратору.');
    }
}
$pageTitle = 'TOPO·CAD';
$pageIcon = 'bi-signpost-2';
require __DIR__ . '/app/views/_head.php';
?>
<style>
  /* Полноэкранный контент только для этой страницы, см. facade_cad.php. */
  .page-main {
    max-width: none;
    margin: 0;
    padding: 0;
    flex: 1 1 auto;
    display: flex;
  }
  .page-title { display: none; }
  #topoCadFrame {
    flex: 1 1 auto;
    width: 100%;
    border: 0;
    display: block;
    min-height: 480px;
  }
</style>
<iframe id="topoCadFrame" src="/assets/topo-cad/index.html" title="TOPO·CAD" allow="clipboard-write; fullscreen"></iframe>
<?php
$extraScripts = <<<'HTML'
<script>
  (function () {
    var sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth >= 992 && !sidebar.classList.contains('sidebar-collapsed')) {
      sidebar.classList.add('sidebar-collapsed');
      try { localStorage.setItem('sidebarCollapsed', '1'); } catch (e) {}
    }
  })();
</script>
HTML;
require __DIR__ . '/app/views/_foot.php';
