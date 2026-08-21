<#
  Диспетчер одного шага SLAM-пайплайна (перенос slamcloude, см.
  app/lib/slam.php и bin/process_slam_jobs.php). Запускается как отдельный
  detached-процесс из process_slam_jobs.php (proc_open, без ожидания) — сам
  отвечает за свой .lock и за запись .done/.error по итогу (тот же
  sidecar-принцип, что copc_convert_worker.ps1/splat_transform_worker.ps1,
  но воркер здесь НЕ трогает БД вообще — вся логика статусов в PHP,
  воркер только запускает node.exe на нужном скрипте и передаёт файлы).

  Каждый Node-скрипт в slam/steps/ сам решает, что ему нужно сделать по
  content'у ContextFile (JSON с путями/метаданными скана), сам вызывает
  внешние бинарники (pdal.exe/untwine.exe/rnx2rtkp.exe) при необходимости,
  и сам пишет DoneFile (JSON с метаданными для БД) либо ErrorFile (текст).
#>
param(
    [Parameter(Mandatory = $true)][string]$Step,
    [Parameter(Mandatory = $true)][string]$ContextFile,
    [Parameter(Mandatory = $true)][string]$DoneFile,
    [Parameter(Mandatory = $true)][string]$ErrorFile,
    [Parameter(Mandatory = $true)][string]$LockFile
)

$ErrorActionPreference = "Stop"
$nodeExe = "C:\Program Files\nodejs\node.exe"
$slamDir = Join-Path (Split-Path -Parent $PSScriptRoot) "slam"

# $Step приходит из slam_jobs.pipeline_step / SLAM_PIPELINE_ORDER (snake_case:
# compute_slam, decode_raw, ...), а файлы в slam/steps/ названы camelCase
# (computeSlam.mjs, decodeRaw.mjs, ...) — тот же стиль, что у остальных .mjs
# в проекте. Раньше здесь просто подставлялось "$Step.mjs" (т.е. буквально
# "compute_slam.mjs") без конверсии в camelCase —
# ни разу не сработало на реальном job'е (Фаза 1/2 проверялась только на
# пустой очереди), обнаружено при первом реальном прогоне compute_slam.
$stepParts = $Step -split '_'
$stepCamel = $stepParts[0]
for ($i = 1; $i -lt $stepParts.Length; $i++) {
    $stepCamel += $stepParts[$i].Substring(0, 1).ToUpper() + $stepParts[$i].Substring(1)
}
$stepScript = Join-Path $slamDir "steps\$stepCamel.mjs"

try {
    if (Test-Path $DoneFile) { Remove-Item $DoneFile -Force }
    if (Test-Path $ErrorFile) { Remove-Item $ErrorFile -Force }

    if (-not (Test-Path $stepScript)) {
        throw "Нет скрипта шага: $stepScript"
    }

    & $nodeExe $stepScript $ContextFile $DoneFile 2>&1 | Out-String -OutVar nodeOutput
    if ($LASTEXITCODE -ne 0) {
        throw "node $stepCamel.mjs exited with code $LASTEXITCODE`: $nodeOutput"
    }
    if (-not (Test-Path $DoneFile)) {
        # Скрипт обязан сам написать DoneFile при успехе (даже если это
        # пустой JSON {} для шага-заглушки) — отсутствие DoneFile при
        # коде выхода 0 — тоже ошибка, а не тихий "готово".
        throw "$stepCamel.mjs завершился без ошибки, но не создал DoneFile: $nodeOutput"
    }
}
catch {
    $_.Exception.Message | Out-File -FilePath $ErrorFile -Encoding utf8
}
finally {
    if (Test-Path $LockFile) { Remove-Item $LockFile -Force -ErrorAction SilentlyContinue }
}
