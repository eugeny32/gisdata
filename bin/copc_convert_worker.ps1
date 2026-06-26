<#
  Конвертирует один LAS-файл в COPC через PDAL (conda-окружение "geo",
  см. docs/PREPROCESSING.md). Запускается как отдельный detached-процесс
  из bin/process_copc_conversions.php (proc_open, без ожидания) — сам
  отвечает за свой lock-файл и сообщение об ошибке, родительский PHP-
  скрипт ничего не ждёт и не отслеживает PID.

  Параметры путей — абсолютные, передаются вызывающим кодом.
#>
param(
    [Parameter(Mandatory = $true)][string]$InputLas,
    [Parameter(Mandatory = $true)][string]$OutputCopc,
    [Parameter(Mandatory = $true)][string]$LockFile,
    [Parameter(Mandatory = $true)][string]$ErrorFile
)

$ErrorActionPreference = "Stop"
$pdalExe = "C:\Users\admin\miniforge3\envs\geo\Library\bin\pdal.exe"
$projDir = "C:\Users\admin\miniforge3\envs\geo\Library\share\proj"
# PDAL определяет writer-драйвер ПО РАСШИРЕНИЮ выходного файла — простое
# ".tmp" в конце ломает автоопределение ("Cannot determine writer for
# output file"), поэтому временный файл должен сам заканчиваться на
# ".copc.laz", "временность" обозначаем вставкой ".converting" перед ним.
$tmpOutput = $OutputCopc -replace '\.copc\.laz$', '.converting.copc.laz'

try {
    if (Test-Path $ErrorFile) { Remove-Item $ErrorFile -Force }

    # См. docs/PREPROCESSING.md — системная PROJ_LIB (от PostGIS) не подходит
    # PDAL из conda-окружения; переопределяем только в этом процессе.
    $env:PROJ_DATA = $projDir
    $env:PROJ_LIB = $projDir

    & $pdalExe translate $InputLas $tmpOutput 2>&1 | Out-String -OutVar pdalOutput
    if ($LASTEXITCODE -ne 0) {
        throw "pdal translate exited with code $LASTEXITCODE`: $pdalOutput"
    }
    if (-not (Test-Path $tmpOutput)) {
        throw "pdal translate reported success but output file is missing: $tmpOutput"
    }

    Move-Item -Path $tmpOutput -Destination $OutputCopc -Force
}
catch {
    $_.Exception.Message | Out-File -FilePath $ErrorFile -Encoding utf8
    if (Test-Path $tmpOutput) { Remove-Item $tmpOutput -Force -ErrorAction SilentlyContinue }
}
finally {
    if (Test-Path $LockFile) { Remove-Item $LockFile -Force -ErrorAction SilentlyContinue }
}
