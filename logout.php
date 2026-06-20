<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
logout();
header('Location: /login.php');
