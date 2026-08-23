[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string[]]$AppNames = @('SHARE3D Engine'),
  [string]$ExecutableName = '3dxnlserver.exe',
  [string]$ProfileDir = '',
  [string]$TemplatePath = '',
  [string]$DeviceId = '',
  [string]$DeviceName = '',
  [string[]]$ButtonActionIds = @(),
  [switch]$SkipRestart
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-DefaultProfileDir {
  return [System.IO.Path]::Combine($env:APPDATA, '3Dconnexion', '3DxWare', 'Cfg')
}

function Get-DefaultTemplatePath {
  return [System.IO.Path]::GetFullPath(
    [System.IO.Path]::Combine($PSScriptRoot, '..', '..', 'resources', '3dconnexion', 'share3d-engine.profile.template.xml')
  )
}

function Get-DriverStatePath {
  return [System.IO.Path]::Combine($env:LOCALAPPDATA, '3Dconnexion', '3DxWare', '3DxServiceState.xml')
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

function Get-BaseConfigPath {
  return [System.IO.Path]::Combine((Get-3DconnexionWinCorePath), 'Cfg', 'Base.xml')
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

function ConvertTo-XmlText {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Value
  )

  return [System.Security.SecurityElement]::Escape($Value)
}

function Get-ProfileId {
  param(
    [Parameter(Mandatory = $true)]
    [string]$AppName
  )

  return "ID_$AppName"
}

function Resolve-3DMouseDefaults {
  param(
    [string]$StatePath,
    [string]$BaseConfigPath
  )

  $resolvedDeviceId = ''
  $resolvedDeviceName = ''
  $resolvedButtonActionIds = @()

  if (Test-Path -LiteralPath $StatePath) {
    $stateXml = [xml](Get-Content -Raw -LiteralPath $StatePath)
    $resolvedDeviceId = "$($stateXml.DriverState.LastInput.DeviceID)".Trim()

    if ($resolvedDeviceId) {
      $deviceNode = @($stateXml.DriverState.DeviceInfoList.Device | Where-Object {
        "$($_.ID)".Trim() -eq $resolvedDeviceId
      })[0]
      if ($deviceNode) {
        $resolvedDeviceName = "$($deviceNode.Name)".Trim()
      }
    }
  }

  if ($resolvedDeviceId -and (Test-Path -LiteralPath $BaseConfigPath)) {
    $baseXml = [xml](Get-Content -Raw -LiteralPath $BaseConfigPath)
    $deviceNode = @($baseXml.SelectNodes("//Device[ID='$resolvedDeviceId']"))[0]
    if ($deviceNode -and $deviceNode.ButtonInfo -and $deviceNode.ButtonInfo.Button) {
      $menuButtons = @($deviceNode.ButtonInfo.Button | Where-Object {
        $label = "$($_.Label)".Trim()
        $label -eq 'STR_Left' -or $label -eq 'STR_Menu'
      })

      foreach ($button in $menuButtons) {
        $resolvedButtonActionIds += "$($button.ParentID)".Trim()
        $resolvedButtonActionIds += "$($button.V3DKID)".Trim()
      }
    }
  }

  $resolvedButtonActionIds = @(Get-UniqueStringList -Items ($resolvedButtonActionIds + @('V3DK_MENU_1', 'V3DK_MENU')))

  if (-not $resolvedDeviceId) {
    $resolvedDeviceId = 'ID_Standard_3D_Mouse'
  }

  if (-not $resolvedDeviceName) {
    $resolvedDeviceName = 'Standard 3D Mouse'
  }

  return [PSCustomObject]@{
    DeviceId = $resolvedDeviceId
    DeviceName = $resolvedDeviceName
    ButtonActionIds = $resolvedButtonActionIds
  }
}

function New-ButtonBindingsXml {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$ActionIds
  )

  $lines = New-Object System.Collections.Generic.List[string]
  foreach ($actionId in @(Get-UniqueStringList -Items $ActionIds)) {
    [void]$lines.Add('        <Button>')
    [void]$lines.Add('          <Input>')
    [void]$lines.Add("            <ActionID>$(ConvertTo-XmlText -Value $actionId)</ActionID>")
    [void]$lines.Add('          </Input>')
    [void]$lines.Add('          <Output>')
    [void]$lines.Add('            <ActionID>Menu_Share3D_MouseRotate</ActionID>')
    [void]$lines.Add('          </Output>')
    [void]$lines.Add('        </Button>')
  }

  return $lines -join [Environment]::NewLine
}

function New-ProfileXml {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Template,
    [Parameter(Mandatory = $true)]
    [string]$AppName,
    [Parameter(Mandatory = $true)]
    [string]$ExecutableName,
    [Parameter(Mandatory = $true)]
    [string]$DeviceId,
    [Parameter(Mandatory = $true)]
    [string]$DeviceName,
    [Parameter(Mandatory = $true)]
    [string[]]$ButtonActionIds
  )

  $generatedAt = Get-Date -Format 'yyyy:M:d:HH:mm:ss:fff'
  $replacements = [ordered]@{
    '{{APP_NAME}}' = ConvertTo-XmlText -Value $AppName
    '{{EXECUTABLE_NAME}}' = ConvertTo-XmlText -Value $ExecutableName
    '{{PROFILE_ID}}' = ConvertTo-XmlText -Value (Get-ProfileId -AppName $AppName)
    '{{DEVICE_ID}}' = ConvertTo-XmlText -Value $DeviceId
    '{{DEVICE_NAME}}' = ConvertTo-XmlText -Value $DeviceName
    '{{BUTTON_BINDINGS}}' = New-ButtonBindingsXml -ActionIds $ButtonActionIds
    '{{GENERATED_AT}}' = ConvertTo-XmlText -Value $generatedAt
  }

  $rendered = $Template
  foreach ($key in $replacements.Keys) {
    $rendered = $rendered.Replace($key, $replacements[$key])
  }

  [void][xml]$rendered
  return $rendered
}

function Write-Utf8File {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [string]$Content
  )

  $directory = Split-Path -Parent $Path
  if ($directory) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $encoding)
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
$resolvedTemplatePath = if ($TemplatePath) { $TemplatePath } else { Get-DefaultTemplatePath }
$driverStatePath = Get-DriverStatePath
$baseConfigPath = Get-BaseConfigPath
$driverServicePath = Get-DriverServicePath

if (-not (Test-Path -LiteralPath $resolvedTemplatePath)) {
  throw "3Dconnexion profile template not found: $resolvedTemplatePath"
}

$deviceDefaults = Resolve-3DMouseDefaults -StatePath $driverStatePath -BaseConfigPath $baseConfigPath
$resolvedDeviceId = if ($DeviceId) { $DeviceId } else { $deviceDefaults.DeviceId }
$resolvedDeviceName = if ($DeviceName) { $DeviceName } else { $deviceDefaults.DeviceName }
$resolvedButtonActionIds = if (@($ButtonActionIds).Count -gt 0) {
  @(Get-UniqueStringList -Items $ButtonActionIds)
} else {
  @($deviceDefaults.ButtonActionIds)
}

$resolvedAppNames = @(Get-UniqueStringList -Items $AppNames)

if (@($resolvedAppNames).Count -eq 0) {
  throw 'At least one app name is required.'
}

$template = Get-Content -Raw -LiteralPath $resolvedTemplatePath
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $resolvedProfileDir "_share3d_engine_backup\\install-$timestamp"

Write-Host "Target profile directory: $resolvedProfileDir"
Write-Host "Detected device: $resolvedDeviceName ($resolvedDeviceId)"
Write-Host "Button action ids: $($resolvedButtonActionIds -join ', ')"
Write-Host "App names: $($resolvedAppNames -join ', ')"

foreach ($appName in $resolvedAppNames) {
  $fileName = "$(ConvertTo-SafeFileName -Value $appName).xml"
  $targetPath = Join-Path $resolvedProfileDir $fileName
  $renderedXml = New-ProfileXml `
    -Template $template `
    -AppName $appName `
    -ExecutableName $ExecutableName `
    -DeviceId $resolvedDeviceId `
    -DeviceName $resolvedDeviceName `
    -ButtonActionIds $resolvedButtonActionIds

  $currentContent = if (Test-Path -LiteralPath $targetPath) {
    Get-Content -Raw -LiteralPath $targetPath
  } else {
    ''
  }

  if ($currentContent -eq $renderedXml) {
    Write-Host "Profile already up to date: $targetPath"
    continue
  }

  if ($PSCmdlet.ShouldProcess($targetPath, 'Install 3Dconnexion profile')) {
    $backupPath = Backup-File -SourcePath $targetPath -BackupRoot $backupRoot
    if ($backupPath) {
      Write-Host "Backed up existing profile: $backupPath"
    }

    Write-Utf8File -Path $targetPath -Content $renderedXml
    Write-Host "Installed profile: $targetPath"
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
