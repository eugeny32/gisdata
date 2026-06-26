<#
  Конвертирует один .ply тур в SOG (streamed-LOD-совместимый, GPU-сортировка
  в движке) + коллизионный .glb (-K, для Walk-режима, PR5). Запускается как
  отдельный detached-процесс из bin/process_splat_transforms.php (proc_open,
  без ожидания) — сам отвечает за свой lock-файл и сообщение об ошибке.

  Два отдельных вызова splat-transform (не один на оба выхода) — каждый сам
  по себе уже подтверждён рабочим вручную; объединение в один проход не
  проверялось и не стоит усложнения ради экономии одного повторного чтения
  файла. Оба выхода считаются одной "конвертацией" (один lock/error-файл) —
  если упал коллайдер после успешного SOG, ни один из выходов не считается
  готовым (см. catch: оба .tmp удаляются, ни SOG, ни collision не появляются
  частично).
#>
param(
    [Parameter(Mandatory = $true)][string]$InputPly,
    [Parameter(Mandatory = $true)][string]$OutputSog,
    [Parameter(Mandatory = $true)][string]$OutputCollision,
    [Parameter(Mandatory = $true)][string]$LockFile,
    [Parameter(Mandatory = $true)][string]$ErrorFile
)

$ErrorActionPreference = "Stop"
$nodeExe = "C:\Program Files\nodejs\node.exe"
$cliScript = "C:\Users\admin\AppData\Roaming\npm\node_modules\@playcanvas\splat-transform\bin\cli.mjs"

# Имя временного файла должно само заканчиваться на .sog/.glb — splat-transform
# определяет формат вывода по расширению (тот же приём, что в
# copc_convert_worker.ps1 для PDAL, см. docs/PREPROCESSING.md/CURRENT_STATE.md).
$tmpSog = $OutputSog -replace '\.sog$', '.converting.sog'
$tmpCollision = $OutputCollision -replace '\.glb$', '.converting.glb'

try {
    if (Test-Path $ErrorFile) { Remove-Item $ErrorFile -Force }

    & $nodeExe $cliScript -w $InputPly $tmpSog
    if ($LASTEXITCODE -ne 0) { throw "splat-transform (SOG) exited with code $LASTEXITCODE" }
    if (-not (Test-Path $tmpSog)) { throw "splat-transform reported success but SOG output is missing: $tmpSog" }

    & $nodeExe $cliScript -w $InputPly -K $tmpCollision
    if ($LASTEXITCODE -ne 0) { throw "splat-transform (collision) exited with code $LASTEXITCODE" }
    if (-not (Test-Path $tmpCollision)) { throw "splat-transform reported success but collision output is missing: $tmpCollision" }

    Move-Item -Path $tmpSog -Destination $OutputSog -Force
    Move-Item -Path $tmpCollision -Destination $OutputCollision -Force
}
catch {
    $_.Exception.Message | Out-File -FilePath $ErrorFile -Encoding utf8
    if (Test-Path $tmpSog) { Remove-Item $tmpSog -Force -ErrorAction SilentlyContinue }
    if (Test-Path $tmpCollision) { Remove-Item $tmpCollision -Force -ErrorAction SilentlyContinue }
}
finally {
    if (Test-Path $LockFile) { Remove-Item $LockFile -Force -ErrorAction SilentlyContinue }
}
