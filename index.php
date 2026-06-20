<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
header('Location: ' . (current_user() ? '/map.php' : '/login.php'));
