<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';

/**
 * CtF·ADMIN — пульт надзора за сеансами FACADE·CAD/TOPO·CAD (кто сейчас
 * работает, живой экран, перехват управления). Сам пульт — отдельный
 * Node-процесс (ctfadmin/server.mjs, слушает только 127.0.0.1:8091),
 * проксируется Apache-ом на /ctfadmin/ (см. httpd-ssl.conf) — эта
 * PHP-страница только гейтит доступ ролью админа gisdata и держит пароль
 * пульта вне открытого HTML (передаётся в iframe только для уже
 * авторизованного администратора).
 *
 * Доступ: только role='admin' — регулярным пользователям, даже с
 * включёнными услугами FACADE·CAD/TOPO·CAD, сюда хода нет.
 */
require_admin_role('admin');

$ctfPass = env('CTFADMIN_ADMIN_PASS');
if (!$ctfPass) {
    http_response_code(500);
    exit('500: CTFADMIN_ADMIN_PASS не задан в .env');
}

$pageTitle = 'CtF·ADMIN';
$pageIcon = 'bi-eye';
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
  #ctfAdminFrame {
    flex: 1 1 auto;
    width: 100%;
    border: 0;
    display: block;
    min-height: 480px;
  }
</style>
<iframe id="ctfAdminFrame"
        src="/ctfadmin/admin?pass=<?= urlencode($ctfPass) ?>"
        title="CtF·ADMIN"></iframe>
<?php
require __DIR__ . '/app/views/_foot.php';
