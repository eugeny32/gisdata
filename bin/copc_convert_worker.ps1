<#
  Конвертирует один LAS-файл в COPC через PDAL (conda-окружение "geo",
  см. docs/PREPROCESSING.md). Запускается как отдельный detached-процесс
  из bin/process_copc_conversions.php (proc_open, без ожидания) — сам
  отвечает за свой lock-файл и сообщение об ошибке, родительский PHP-
  скрипт ничего не ждёт и не отслеживает PID.

  Параметры путей — абсолютные, передаются вызывающим кодом.

  Живой случай на проде: файл на 1.58 МЛРД точек (56ГБ) стабильно валил
  `pdal translate` с "exited with code -1073740791" (STATUS_STACK_OVERFLOW,
  Windows) — похоже на переполнение стека при построении октодерева COPC
  в PDAL 2.10.2 на таком масштабе (на файлах поменьше тот же вызов отработал
  штатно). untwine — отдельный инструмент ТОГО ЖЕ проекта PDAL, специально
  спроектированный для потокового построения COPC/EPT на произвольно
  больших облаках (в отличие от writers.copc внутри pdal translate,
  рассчитанного скорее на умеренные объёмы) — используется как FALLBACK
  ПОСЛЕ неудачи pdal translate, а не замена: pdal translate уже успешно
  отработал на 5 из 6 файлов в проде, менять инструмент для рабочего случая
  незачем. Формат вывода untwine определяется тем же способом (расширение
  .copc.laz -> один файл, не EPT-директория) — проверено вручную на живом
  файле перед тем, как полагаться на это в автоматике.
#>
param(
    [Parameter(Mandatory = $true)][string]$InputLas,
    [Parameter(Mandatory = $true)][string]$OutputCopc,
    [Parameter(Mandatory = $true)][string]$LockFile,
    [Parameter(Mandatory = $true)][string]$ErrorFile
)

$ErrorActionPreference = "Stop"
$pdalExe = "C:\Users\admin\miniforge3\envs\geo\Library\bin\pdal.exe"
$untwineExe = "C:\Users\admin\miniforge3\envs\geo\Library\bin\untwine.exe"
$projDir = "C:\Users\admin\miniforge3\envs\geo\Library\share\proj"
# PDAL/untwine определяют writer/output по РАСШИРЕНИЮ выходного файла —
# простое ".tmp" в конце ломает автоопределение ("Cannot determine writer
# for output file"), поэтому временный файл должен сам заканчиваться на
# ".copc.laz", "временность" обозначаем вставкой ".converting" перед ним.
$tmpOutput = $OutputCopc -replace '\.copc\.laz$', '.converting.copc.laz'

try {
    if (Test-Path $ErrorFile) { Remove-Item $ErrorFile -Force }

    # См. docs/PREPROCESSING.md — системная PROJ_LIB (от PostGIS) не подходит
    # PDAL из conda-окружения; переопределяем только в этом процессе. untwine
    # использует ту же conda-среду и те же переменные.
    $env:PROJ_DATA = $projDir
    $env:PROJ_LIB = $projDir

    $pdalError = $null
    try {
        & $pdalExe translate $InputLas $tmpOutput 2>&1 | Out-String -OutVar pdalOutput
        if ($LASTEXITCODE -ne 0) {
            throw "pdal translate exited with code $LASTEXITCODE`: $pdalOutput"
        }
        if (-not (Test-Path $tmpOutput)) {
            throw "pdal translate reported success but output file is missing: $tmpOutput"
        }
    }
    catch {
        $pdalError = $_.Exception.Message
        if (Test-Path $tmpOutput) { Remove-Item $tmpOutput -Force -ErrorAction SilentlyContinue }
    }

    if ($pdalError) {
        # pdal translate failed -- fall back to untwine (see comment above).
        & $untwineExe -i $InputLas -o $tmpOutput 2>&1 | Out-String -OutVar untwineOutput
        if ($LASTEXITCODE -ne 0) {
            throw "pdal translate failed ($pdalError); untwine fallback also exited with code $LASTEXITCODE`: $untwineOutput"
        }
        if (-not (Test-Path $tmpOutput)) {
            throw "pdal translate failed ($pdalError); untwine fallback reported success but output is missing: $tmpOutput"
        }
    }

    Move-Item -Path $tmpOutput -Destination $OutputCopc -Force
}
catch {
    $_.Exception.Message | Out-File -FilePath $ErrorFile -Encoding utf8
    if (Test-Path $tmpOutput) { Remove-Item $tmpOutput -Force -ErrorAction SilentlyContinue }
}
finally {
    if (Test-Path $LockFile) { Remove-Item $LockFile -Force -ErrorAction SilentlyContinue }
    # Служебные файлы отслеживания зависаний (см. process_copc_conversions.php)
    # — не нужны после ЛЮБОГО завершения (успех или явная ошибка), иначе
    # остаются висеть мусором навсегда.
    $progressFile = $OutputCopc + ".progress"
    $retriesFile = $OutputCopc + ".stall_retries"
    if (Test-Path $progressFile) { Remove-Item $progressFile -Force -ErrorAction SilentlyContinue }
    if (Test-Path $retriesFile) { Remove-Item $retriesFile -Force -ErrorAction SilentlyContinue }
}
