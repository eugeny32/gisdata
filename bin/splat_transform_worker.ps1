<#
  Конвертирует один .ply тур в SOG (streamed-LOD-совместимый, GPU-сортировка
  в движке) + коллизионный .glb (-K, для Walk-режима, PR5). Запускается как
  отдельный detached-процесс из bin/process_splat_transforms.php (proc_open,
  без ожидания) — сам отвечает за свой lock-файл и сообщение об ошибке.

  Два отдельных вызова splat-transform — НЕЗАВИСИМЫЕ по успеху/неудаче
  (живой случай на проде: 2 тура по ~15.5M гауссиан, SOG успешно
  посчитался за ~1ч10м, а -K коллайдер тут же падал с
  "RangeError: Invalid array buffer length" — похоже, внутреннее
  ограничение splat-transform на очень больших/плотных облаках). Раньше
  падение коллайдера ПОСЛЕ успешного (и дорогого!) SOG выбрасывало и его
  тоже (единый lock/error на оба выхода) — тур оставался вообще без
  модели, хотя SOG для показа был готов. Теперь: SOG — обязательная
  часть (её падение = вся конвертация в .error, как раньше); коллайдер —
  необязательная (Walk и так молча работает как Fly без него, см.
  tourViewer.ts/updateFlyCollision) — его падение просто пишет
  .collision.error и не трогает уже готовый SOG.
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
$collisionErrorFile = $OutputCollision + '.error'

try {
    if (Test-Path $ErrorFile) { Remove-Item $ErrorFile -Force }

    # -G/--filter-floaters: убирает гауссианы, не примыкающие ни к одному
    # "плотному" вокселю (по умолчанию 0.05,0.1,0.004 — размер вокселя,
    # порог занятости, мин. вклад) — именно те одиночные крупные
    # полупрозрачные сплаты без соседей рядом (частый артефакт над водой/
    # отражениями), которые "светятся" в пустоту вместо реальной
    # поверхности. По запросу пользователя: "если соседних сплатов рядом
    # нет — не светить в эту сторону". Дефолтные параметры инструмента —
    # не подбираем свои вслепую, это протестированные значения от авторов
    # splat-transform именно под эту задачу.
    & $nodeExe $cliScript -w $InputPly -G $tmpSog
    if ($LASTEXITCODE -ne 0) { throw "splat-transform (SOG) exited with code $LASTEXITCODE" }
    if (-not (Test-Path $tmpSog)) { throw "splat-transform reported success but SOG output is missing: $tmpSog" }
    Move-Item -Path $tmpSog -Destination $OutputSog -Force

    try {
        if (Test-Path $collisionErrorFile) { Remove-Item $collisionErrorFile -Force }
        & $nodeExe $cliScript -w $InputPly -K $tmpCollision
        if ($LASTEXITCODE -ne 0) { throw "splat-transform (collision) exited with code $LASTEXITCODE" }
        if (-not (Test-Path $tmpCollision)) { throw "splat-transform reported success but collision output is missing: $tmpCollision" }
        Move-Item -Path $tmpCollision -Destination $OutputCollision -Force
    }
    catch {
        # Коллайдер необязателен (см. комментарий выше) — тур остаётся
        # рабочим (SOG уже на месте), просто без коллизий в режиме "Прогулка".
        $_.Exception.Message | Out-File -FilePath $collisionErrorFile -Encoding utf8
        if (Test-Path $tmpCollision) { Remove-Item $tmpCollision -Force -ErrorAction SilentlyContinue }
    }
}
catch {
    $_.Exception.Message | Out-File -FilePath $ErrorFile -Encoding utf8
    if (Test-Path $tmpSog) { Remove-Item $tmpSog -Force -ErrorAction SilentlyContinue }
    if (Test-Path $tmpCollision) { Remove-Item $tmpCollision -Force -ErrorAction SilentlyContinue }
}
finally {
    if (Test-Path $LockFile) { Remove-Item $LockFile -Force -ErrorAction SilentlyContinue }
}
