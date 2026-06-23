<#
  Upload CHANGED project files to the hosting server via FTP.
  "Changed" = files that differ between the last deployed commit (tracked
  in .ftp_deploy_marker, gitignored - local to this machine only) and the
  current working tree: committed changes since that commit, PLUS any
  currently uncommitted modified/added files. Deleted files are listed but
  never auto-deleted on the server (uploading is one-directional). .claude/
  is always excluded (Claude Code tooling, not part of the site).

  If .ftp_deploy_marker is missing (first run), falls back to the full
  `git ls-files` list.

  FTP credentials come only from .env (FTP_HOST/FTP_PORT/FTP_USER/
  FTP_PASSWORD/FTP_REMOTE_DIR) - never hardcode them in this file.

  Default mode is a dry run (file list only, nothing uploaded, marker not
  updated). Real upload requires the explicit -Yes flag:
    powershell -File bin\deploy_ftp.ps1          # preview changed files
    powershell -File bin\deploy_ftp.ps1 -Yes     # actually upload + update marker
#>
param(
    [switch]$Yes
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot ".env"
$markerPath = Join-Path $repoRoot ".ftp_deploy_marker"

if (-not (Test-Path $envPath)) {
    Write-Error ".env not found ($envPath) - need FTP_HOST/FTP_PORT/FTP_USER/FTP_PASSWORD/FTP_REMOTE_DIR"
    exit 1
}

$envVars = @{}
foreach ($line in Get-Content $envPath) {
    if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
    $parts = $line -split '=', 2
    $envVars[$parts[0].Trim()] = $parts[1].Trim()
}

$ftpHost = $envVars['FTP_HOST']
$ftpPort = $envVars['FTP_PORT']
$ftpUser = $envVars['FTP_USER']
$ftpPass = $envVars['FTP_PASSWORD']
$ftpDir = $envVars['FTP_REMOTE_DIR']

if (-not $ftpHost -or -not $ftpUser -or -not $ftpDir) {
    Write-Error "FTP_HOST/FTP_USER/FTP_REMOTE_DIR are not set in .env"
    exit 1
}
if (-not $ftpPort) { $ftpPort = "21" }

Set-Location $repoRoot

$lastDeployed = $null
if (Test-Path $markerPath) {
    $lastDeployed = (Get-Content $markerPath -Raw).Trim()
}

if ($lastDeployed) {
    # Committed changes since last deploy (A=added, C=copied, M=modified,
    # R=renamed - never D=deleted, we don't delete files on the server here).
    $committed = git diff --name-only --diff-filter=ACMR $lastDeployed HEAD
    # Plus anything currently modified/added but not yet committed.
    $uncommitted = git status --porcelain | Where-Object { $_ -notmatch '^.D ' } | ForEach-Object { $_.Substring(3) }
    $files = @($committed) + @($uncommitted) | Where-Object { $_ } | Select-Object -Unique
} else {
    Write-Output "No .ftp_deploy_marker found - this looks like the first run, falling back to the full file list."
    $files = git ls-files
}

$files = $files | Where-Object { $_ -notmatch '^\.claude/' } | Where-Object { Test-Path $_ }

if ($files.Count -eq 0) {
    Write-Output "Nothing changed since the last deploy ($lastDeployed) - nothing to upload."
    exit 0
}

Write-Output "Changed files to upload: $($files.Count)"
Write-Output "Target: ftp://$ftpHost`:$ftpPort/$ftpDir/"
Write-Output ""
$files | ForEach-Object { Write-Output "  $_" }

if (-not $Yes) {
    Write-Output ""
    Write-Output "Dry run only (preview). Re-run with -Yes to actually upload."
    exit 0
}

Write-Output ""
Write-Output "Uploading..."
$failed = @()
foreach ($f in $files) {
    $remoteUrl = "ftp://$ftpHost`:$ftpPort/$ftpDir/$($f -replace '\\','/')"
    & curl.exe --ftp-create-dirs -s -S --user "${ftpUser}:${ftpPass}" -T $f $remoteUrl
    if ($LASTEXITCODE -ne 0) {
        $failed += $f
        Write-Output "  FAILED: $f"
    } else {
        Write-Output "  OK: $f"
    }
}

if ($failed.Count -gt 0) {
    Write-Output ""
    Write-Output "Failed to upload $($failed.Count) file(s):"
    $failed | ForEach-Object { Write-Output "  $_" }
    Write-Output "Marker NOT updated (so the failed files will be retried next time)."
    exit 1
}

git rev-parse HEAD | Out-File -FilePath $markerPath -Encoding ascii -NoNewline
Write-Output ""
Write-Output "Done - uploaded $($files.Count) file(s). Marker updated."
