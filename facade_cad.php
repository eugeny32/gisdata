<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';

/**
 * FACADE·CAD — сторонний веб-CAD инструмент (github.com/skandmataisabella1357-beep/CtF,
 * реальное имя проекта FACADE·CAD) для черчения фасадов поверх облаков точек.
 * Исходники — facade-cad/ (npm-проект, собирается через vite build прямо в
 * assets/facade-cad/ — тот же приём, что ../viewer -> ../assets/viewer,
 * см. facade-cad/vite.config.ts). Инструмент грузится через iframe, а не
 * встраивается в DOM страницы — у него собственный полноценный HTML/CSS
 * (Tailwind), встраивание в DOM рисковало бы конфликтом классов с Bootstrap;
 * iframe гарантирует, что внешний вид останется РОВНО таким же, как в
 * оригинале. Рабочее состояние (слои/геометрия/ПСК) сохраняется на сервере
 * через api/facade_cad_session.php (Postgres/PostGIS) — сам импорт облака
 * (LAS/LAZ/E57/XYZ) остаётся локальным, через системный диалог выбора файла.
 *
 * Доступ: админам — всегда; обычным пользователям — только если у них
 * включена услуга FACADE·CAD (users_sync.facade_cad_enabled, см. users.php).
 * Та же проверка повторяется в api/facade_cad_session.php на каждый запрос.
 */
require_login(); // админ ИЛИ обычный пользователь — раздел ниже сам решает, кому что
$admin = current_admin();
$user = current_user();
if (!$admin) {
    $pdo = db();
    $chk = $pdo->prepare('SELECT facade_cad_enabled FROM users_sync WHERE id = :id');
    $chk->execute(['id' => $user['id']]);
    if (!(int)$chk->fetchColumn()) {
        http_response_code(403);
        exit('403 Forbidden: услуга FACADE·CAD не подключена для вашего аккаунта — обратитесь к администратору.');
    }
}
$pageTitle = 'FACADE·CAD';
$pageIcon = 'bi-rulers';
require __DIR__ . '/app/views/_head.php';
?>
<style>
  /* Полноэкранный контент только для этой страницы -- обычная раскладка
     .page-main (узкая колонка + отступы, см. assets/style.css) тут не
     подходит: инструмент сам управляет всей своей площадью (собственный
     WebGL-канвас на весь экран). Остальной layout (_head.php/_foot.php,
     сайдбар, топбар) не трогаем. */
  .page-main {
    max-width: none;
    margin: 0;
    padding: 0;
    flex: 1 1 auto;
    display: flex;
  }
  .page-title { display: none; }
  #facadeCadFrame {
    flex: 1 1 auto;
    width: 100%;
    border: 0;
    display: block;
    min-height: 480px;
  }
</style>
<iframe id="facadeCadFrame" src="/assets/facade-cad/index.html" title="FACADE·CAD" allow="clipboard-write; fullscreen"></iframe>
<?php
$extraScripts = <<<'HTML'
<script>
  // "Открывать в полноэкранном режиме" -- сворачиваем сайдбар сразу при
  // заходе на страницу (тот же toggle, что и кнопка в топбаре, см.
  // _foot.php), чтобы инструмент сразу занял весь экран; пользователь может
  // развернуть сайдбар обратно той же кнопкой.
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
