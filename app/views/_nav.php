<?php $u = current_user(); $a = current_admin(); ?>
<nav class="topnav">
  <a href="/map.php">Карта</a>
  <?php if ($a): ?><a href="/stations.php">Станции</a><?php endif; ?>
  <a href="/rinex.php">RINEX</a>
  <span class="spacer"></span>
  <?php if ($a): ?>
    <span class="user-name">админ: <?= htmlspecialchars($a['login'], ENT_QUOTES, 'UTF-8') ?></span>
    <a href="/logout.php">Выход</a>
  <?php elseif ($u): ?>
    <span class="user-name"><?= htmlspecialchars($u['name'], ENT_QUOTES, 'UTF-8') ?></span>
    <a href="/admin_login.php">Вход суперпользователя</a>
    <a href="/logout.php">Выход</a>
  <?php endif; ?>
</nav>
