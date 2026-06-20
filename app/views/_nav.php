<?php $u = current_user(); ?>
<nav class="topnav">
  <a href="/map.php">Карта</a>
  <a href="/stations.php">Станции</a>
  <a href="/rinex.php">RINEX</a>
  <span class="spacer"></span>
  <?php if ($u): ?>
    <span class="user-name"><?= htmlspecialchars($u['name'], ENT_QUOTES, 'UTF-8') ?></span>
    <a href="/logout.php">Выход</a>
  <?php endif; ?>
</nav>
