[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string[]]$AppNames = @('SHARE3D Engine'),
  [string]$ProfileDir = '',
  [switch]$SkipRestart
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-DefaultProfileDir {
  return [System.IO.Path]::Combine($env:APPDATA, '3Dconnexion', '3DxWare', 'Cfg')
}

function Get-ExecutablePathFromCommandLine {
  param(
    [string]$CommandLine
  )

  if ([string]::IsNullOrWhiteSpace($CommandLine)) {
    return ''
  }

  $trimmed = $CommandLine.Trim()
  if ($trimmed.StartsWith('"')) {
    $closingQuoteIndex = $trimmed.IndexOf('"', 1)
    if ($closingQuoteIndex -gt 1) {
      return $trimmed.Substring(1, $closingQuoteIndex - 1)
    }
  }

  return ($trimmed -split '\s+', 2)[0]
}

function Get-3DconnexionWinCorePath {
  $candidateDirectories = New-Object System.Collections.Generic.List[string]

  foreach ($registryPath in @(
    'HKLM:\SOFTWARE\3Dconnexion\3DxWare',
    'HKLM:\SOFTWARE\WOW6432Node\3Dconnexion\3DxWare'
  )) {
    if (-not (Test-Path -LiteralPath $registryPath)) {
      continue
    }

    try {
      $registryItem = Get-ItemProperty -LiteralPath $registryPath -ErrorAction Stop
      $homeDirectory = "$($registryItem.'Home Directory')".Trim()
      if ($homeDirectory) {
        [void]$candidateDirectories.Add($homeDirectory)
      }
    } catch {}
  }

  try {
    $serviceCandidates = Get-CimInstance Win32_Service -ErrorAction Stop | Where-Object {
      $_.Name -eq '3DxService' -or $_.Name -eq 'Mgl3DCtlrRPCService' -or $_.DisplayName -like '3Dconnexion*'
    }

    foreach ($service in $serviceCandidates) {
      $serviceExecutablePath = Get-ExecutablePathFromCommandLine -CommandLine "$($service.PathName)"
      if (-not $serviceExecutablePath) {
        continue
      }

      $serviceDirectory = Split-Path -Parent $serviceExecutablePath
      if ($serviceDirectory) {
        [void]$candidateDirectories.Add($serviceDirectory)
      }
    }
  } catch {}

  foreach ($baseDirectory in @($env:ProgramFiles, ${env:ProgramFiles(x86)})) {
    if ([string]::IsNullOrWhiteSpace($baseDirectory)) {
      continue
    }

    [void]$candidateDirectories.Add((Join-Path $baseDirectory '3Dconnexion\3DxWare\3DxWinCore'))
  }

  foreach ($candidateDirectory in $candidateDirectories) {
    if ([string]::IsNullOrWhiteSpace($candidateDirectory)) {
      continue
    }

    $resolvedDirectory = [System.IO.Path]::GetFullPath($candidateDirectory.Trim())
    if (Test-Path -LiteralPath $resolvedDirectory) {
      return $resolvedDirectory
    }
  }

  return [System.IO.Path]::GetFullPath(
    [System.IO.Path]::Combine($env:ProgramFiles, '3Dconnexion', '3DxWare', '3DxWinCore')
  )
}

function Get-DriverServicePath {
  return [System.IO.Path]::Combine((Get-3DconnexionWinCorePath), '3DxService.exe')
}

function Get-UniqueStringList {
  param(
    [Parameter(Mandatory = $true)]
    [AllowEmptyCollection()]
    [string[]]$Items
  )

  $result = New-Object System.Collections.Generic.List[string]
  foreach ($item in $Items) {
    if ([string]::IsNullOrWhiteSpace($item)) {
      continue
    }

    $trimmed = $item.Trim()
    if (-not $result.Contains($trimmed)) {
      [void]$result.Add($trimmed)
    }
  }

  return $result.ToArray()
}

function ConvertTo-SafeFileName {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  $safe = $Value
  foreach ($invalidChar in [System.IO.Path]::GetInvalidFileNameChars()) {
    $safe = $safe.Replace($invalidChar, '_')
  }

  return $safe
}

function Backup-File {
  param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,
    [Parameter(Mandatory = $true)]
    [string]$BackupRoot
  )

  if (-not (Test-Path -LiteralPath $SourcePath)) {
    return $null
  }

  New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
  $destination = Join-Path $BackupRoot (Split-Path -Leaf $SourcePath)
  Copy-Item -LiteralPath $SourcePath -Destination $destination -Force
  return $destination
}

function Restart-3DconnexionDriver {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ServiceExePath
  )

  $processNames = @(
    '3DxNumpad',
    '3dxpiemenus',
    '3DxVirtualLCD',
    '3dxnlserver',
    '3DxProfileServer',
    '3DxService'
  )

  Get-Process | Where-Object { $processNames -contains $_.ProcessName } |
    Stop-Process -Force -ErrorAction SilentlyContinue

  Start-Sleep -Seconds 2

  if (Test-Path -LiteralPath $ServiceExePath) {
    Start-Process -FilePath $ServiceExePath | Out-Null
    Start-Sleep -Seconds 5
    return
  }

  Write-Warning "3Dconnexion service executable not found: $ServiceExePath"
}

$resolvedProfileDir = if ($ProfileDir) { $ProfileDir } else { Get-DefaultProfileDir }
$driverServicePath = Get-DriverServicePath
$resolvedAppNames = @(Get-UniqueStringList -Items $AppNames)

if (@($resolvedAppNames).Count -eq 0) {
  throw 'At least one app name is required.'
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $resolvedProfileDir "_share3d_engine_backup\\uninstall-$timestamp"

Write-Host "Target profile directory: $resolvedProfileDir"
Write-Host "App names: $($resolvedAppNames -join ', ')"

foreach ($appName in $resolvedAppNames) {
  $fileName = "$(ConvertTo-SafeFileName -Value $appName).xml"
  $targetPath = Join-Path $resolvedProfileDir $fileName

  if (-not (Test-Path -LiteralPath $targetPath)) {
    Write-Host "Profile not found, skipped: $targetPath"
    continue
  }

  if ($PSCmdlet.ShouldProcess($targetPath, 'Remove 3Dconnexion profile')) {
    $backupPath = Backup-File -SourcePath $targetPath -BackupRoot $backupRoot
    if ($backupPath) {
      Write-Host "Backed up profile before removal: $backupPath"
    }

    Remove-Item -LiteralPath $targetPath -Force
    Write-Host "Removed profile: $targetPath"
  }
}

if (-not $SkipRestart) {
  if ($PSCmdlet.ShouldProcess($driverServicePath, 'Restart 3Dconnexion driver')) {
    Restart-3DconnexionDriver -ServiceExePath $driverServicePath
    Write-Host 'Restarted 3Dconnexion driver.'
  }
} else {
  Write-Host 'Skipped 3Dconnexion driver restart.'
}
