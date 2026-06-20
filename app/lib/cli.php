<?php
declare(strict_types=1);

/**
 * Скрипты в bin/ написаны для CLI (php bin\xxx.php), но на этом хостинге
 * нет SSH/CLI-доступа — их запускают через HTTP (просто открывая URL), где
 * STDOUT/STDERR/$argv не определены. Эти хелперы делают вывод и аргументы
 * безопасными в обоих режимах.
 */

function cli_out(string $msg): void
{
    if (php_sapi_name() === 'cli') {
        fwrite(STDOUT, $msg . PHP_EOL);
    } else {
        echo htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') . "<br>\n";
    }
}

function cli_err(string $msg): void
{
    if (php_sapi_name() === 'cli') {
        fwrite(STDERR, $msg . PHP_EOL);
    } else {
        echo '<b style="color:red">' . htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') . '</b><br>' . "\n";
    }
}

/** Возвращает аргумент и из $argv (CLI), и из $_GET/$_POST (запуск через браузер/веб-крон). */
function cli_arg(int $position, string $webKey): ?string
{
    global $argv;
    if (php_sapi_name() === 'cli') {
        return $argv[$position] ?? null;
    }
    $value = $_POST[$webKey] ?? $_GET[$webKey] ?? null;
    return $value !== null && $value !== '' ? (string)$value : null;
}

/**
 * Скрипты, которые не предполагают ввод чувствительных данных через URL
 * (синхронизация, опрос станций), разрешены через веб только с верным
 * токеном (см. .env: CRON_TOKEN) — это нужно, если на хостинге cron дёргает
 * URL вместо запуска php напрямую. Без CLI и без верного токена — 403.
 */
function require_cli_or_token(): void
{
    if (php_sapi_name() === 'cli') {
        return;
    }
    $expected = env('CRON_TOKEN', '');
    $given = $_GET['token'] ?? '';
    if ($expected === '' || !hash_equals($expected, (string)$given)) {
        http_response_code(403);
        exit("403 Forbidden: запуск через браузер требует ?token=<CRON_TOKEN из .env>\n");
    }
}
