<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';

/**
 * FACADE·FOTO — ректификация фасада по контрольным точкам: чертёж +
 * историческое фото совмещаются гомографией (DLT, с коррекцией дисторсии
 * объектива), даёт выпрямленное фото/наложение и отчёт о точности. Не
 * связано с FACADE·CAD/TOPO·CAD (другой движок, другая задача) — просто
 * третий инструмент в том же разделе. Исходник — facade-foto/index.html,
 * самодостаточный HTML+JS (без npm/vite — единственная внешняя
 * зависимость, pdf.js, грузится с cdnjs), раздаётся статикой из
 * assets/facade-foto/index.html.
 *
 * Рабочее состояние (контрольные точки/дисторсия/масштаб) сохраняется на
 * сервере через api/facade_foto_session.php (Postgres, JSONB) — сами
 * изображения (чертёж/фото) остаются локальными в браузере, инструмент их
 * никуда не отправляет.
 *
 * Доступ: админам — всегда; обычным пользователям — только если у них
 * включена услуга FACADE·FOTO (users_sync.facade_foto_enabled, см.
 * users.php) — отдельная от facade_cad_enabled/topo_cad_enabled услуга.
 */
require_login();
$admin = current_admin();
$user = current_user();
if (!$admin) {
    $pdo = db();
    $chk = $pdo->prepare('SELECT facade_foto_enabled FROM users_sync WHERE id = :id');
    $chk->execute(['id' => $user['id']]);
    if (!(int)$chk->fetchColumn()) {
        http_response_code(403);
        exit('403 Forbidden: услуга FACADE·FOTO не подключена для вашего аккаунта — обратитесь к администратору.');
    }
}
$pageTitle = 'FACADE·FOTO';
$pageIcon = 'bi-image';
require __DIR__ . '/app/views/_head.php';
?>
<style>
  .page-main {
    max-width: none;
    margin: 0;
    padding: 0;
    flex: 1 1 auto;
    display: flex;
  }
  .page-title { display: none; }
  #facadeFotoFrame {
    flex: 1 1 auto;
    width: 100%;
    border: 0;
    display: block;
    min-height: 480px;
  }
</style>
<iframe id="facadeFotoFrame" src="/assets/facade-foto/index.html" title="FACADE·FOTO" allow="clipboard-write; fullscreen"></iframe>
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
