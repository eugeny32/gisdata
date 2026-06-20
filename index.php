<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
header('Location: ' . ((current_user() || current_admin()) ? '/home.php' : '/login.php'));
