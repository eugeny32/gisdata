<?php
declare(strict_types=1);

/**
 * Минимальный загрузчик .env без внешних зависимостей (composer на shared-
 * хостинге может быть недоступен). Поддерживает строки KEY=VALUE, пустые
 * строки, комментарии (#) и значения в кавычках. Не перезатирает уже
 * установленные переменные окружения (реальный env имеет приоритет над .env).
 */
function load_env(string $path = __DIR__ . '/../../.env'): void
{
    static $loaded = false;
    if ($loaded || !is_file($path)) {
        return;
    }
    $loaded = true;

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if (strlen($value) >= 2 && (
            ($value[0] === '"' && substr($value, -1) === '"') ||
            ($value[0] === "'" && substr($value, -1) === "'")
        )) {
            $value = substr($value, 1, -1);
        }
        if (getenv($key) === false) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

function env(string $key, $default = null)
{
    $value = getenv($key);
    return $value === false ? $default : $value;
}
