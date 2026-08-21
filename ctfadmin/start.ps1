# Запускает CtF·ADMIN (server.mjs) с настройками из .env (см. корень
# репозитория) вместо переменных окружения, заданных вручную — тот же
# приём чтения .env, что и в bin/deploy_ftp.ps1 / apply_*_migration.ps1.
# Вызывается Планировщиком заданий (\CtfAdminServer, at logon,
# RestartOnFailure) — см. ctfadmin/README.md.
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot ".env"

$envVars = @{}
foreach ($line in Get-Content $envPath) {
    if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
    $parts = $line -split '=', 2
    $envVars[$parts[0].Trim()] = $parts[1].Trim()
}

$env:PORT = $envVars['CTFADMIN_PORT']
if (-not $env:PORT) { $env:PORT = '8091' }
$env:HOST = '127.0.0.1'  # только локально — наружу через Apache reverse proxy
$env:ADMIN_PASS = $envVars['CTFADMIN_ADMIN_PASS']
if (-not $env:ADMIN_PASS) { throw "CTFADMIN_ADMIN_PASS не задан в .env" }

Set-Location $PSScriptRoot
& node server.mjs
