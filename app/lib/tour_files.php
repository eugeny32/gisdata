<?php

declare(strict_types=1);

/**
 * Общая обработка файлов моделей туров (PLY-денойз + чистка заголовка) —
 * вынесено из tours.php в отдельный файл, чтобы тем же кодом мог
 * пользоваться и tour_user_upload.php (загрузка собственных туров обычными
 * пользователями, без доступа к остальной админ-логике tours.php).
 */

/**
 * Чистит сплат-файл (.ply) от двух типов шума, на которые жаловался
 * пользователь — "единичные гауссианы без соседей, закрывающие просмотр
 * свечением" — через CLI @playcanvas/splat-transform (GPU-вокселизация),
 * установленный на сервере по SSH в этой же сессии:
 *   1) -V scale_*,lt,N — гигантские по размеру отдельные сплаты (в реальном
 *      туре встречались sca le до 18-26м при медиане ~0.02м — они и дают тот
 *      самый "глоу", и из-за них раздувается bounding box для вокселизации
 *      на шаге 2, так что без этого шага -G падает с RangeError на больших
 *      сценах);
 *   2) -G — стандартный voxel-based фильтр "точек без соседей" из самого
 *      инструмента.
 * Жёстко прописанные пути — это конкретная установка на ЭТОМ сервере
 * (Windows, see SSH-сессию), а не переносимая конфигурация; на машине, где
 * splat-transform не установлен (например, локальная дев-среда), node.exe
 * по этому пути просто не существует — функция тихо пропускает шаг,
 * исходный файл остаётся как был (это значит "без денойза", не ошибка).
 * Если сам процесс упал (RangeError на экстремально большом экстенте,
 * таймаут и т.п.) — тоже тихо оставляем оригинал: денойз — это улучшение
 * качества, а не обязательное условие создания тура.
 */
function denoise_splat_ply_if_possible(string $absolutePath): void
{
    $nodeExe = 'C:\\Program Files\\nodejs\\node.exe';
    $cliScript = 'C:\\Users\\admin\\AppData\\Roaming\\npm\\node_modules\\@playcanvas\\splat-transform\\bin\\cli.mjs';
    if (!is_file($nodeExe) || !is_file($cliScript) || !is_file($absolutePath)) {
        return;
    }

    $tmpOut = $absolutePath . '.denoised.ply';
    $cmd = sprintf(
        '%s %s %s -N -V scale_0,lt,2 -V scale_1,lt,2 -V scale_2,lt,2 -G %s -w',
        escapeshellarg($nodeExe),
        escapeshellarg($cliScript),
        escapeshellarg($absolutePath),
        escapeshellarg($tmpOut)
    );

    $proc = proc_open($cmd, [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    if (!is_resource($proc)) {
        return;
    }
    // PHP-овский max_execution_time (по умолчанию 120с в php.ini) считает
    // именно это время ожидания дочернего процесса и обрывает скрипт
    // ("Fatal error: Maximum execution time exceeded") раньше, чем
    // успевает сработать наш собственный 300-секундный $deadline ниже —
    // set_time_limit() двигает лимит именно с этого момента.
    set_time_limit(330);
    stream_set_blocking($pipes[1], false);
    stream_set_blocking($pipes[2], false);
    $deadline = time() + 300; // не должно занимать больше пары минут на реальных файлах туров
    do {
        // Прогресс-бар инструмента пишет в stdout/stderr часто — если не
        // вычитывать пайпы, буфер (на Windows ~64КБ) заполняется и дочерний
        // процесс блокируется на записи, то есть зависает не из-за реальной
        // работы, а из-за того, что никто не читает его вывод. Содержимое
        // нам не нужно, просто дренируем.
        fread($pipes[1], 65536);
        fread($pipes[2], 65536);
        usleep(200000);
        $status = proc_get_status($proc);
    } while ($status['running'] && time() < $deadline);
    if ($status['running']) {
        proc_terminate($proc);
    }
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($proc);

    if (!$status['running'] && $status['exitcode'] === 0 && is_file($tmpOut)) {
        unlink($absolutePath);
        rename($tmpOut, $absolutePath);
    } elseif (is_file($tmpOut)) {
        unlink($tmpOut); // неудачный/частичный результат — не подменяем оригинал
    }
}

/**
 * Движок PlayCanvas (его встроенный PlyParser, см.
 * viewer/node_modules/playcanvas/.../parsers/ply.js, parseHeader()) умеет
 * заголовок PLY ТОЛЬКО из строк ply/format/comment/element/property/
 * end_header — на любой другой токен первым словом строки бросает
 * "Unrecognized header value 'X' in ply header" и тур вообще не
 * открывается. Часть экспортёров (замечено на одном из туров пользователя)
 * пишут необязательную (по спецификации Stanford PLY) строку "obj_info
 * ..." — валидный PLY, но непонятный конкретно этому парсеру. Чиним один
 * раз при загрузке файла на сервер, а не на каждый показ — переписываем
 * только текстовый заголовок (до "end_header\n"), бинарный/текстовый
 * хвост с данными копируется потоково, без чтения файла целиком в память
 * (модели — от десятков МБ до единиц ГБ).
 */
function strip_unsupported_ply_header_lines(string $absolutePath): void
{
    if (!is_file($absolutePath)) {
        return;
    }
    $src = fopen($absolutePath, 'rb');
    if (!$src) {
        return;
    }
    $headBuf = fread($src, 65536);
    if (substr($headBuf, 0, 3) !== 'ply') {
        fclose($src);
        return;
    }
    $terminator = "end_header\n";
    $endPos = strpos($headBuf, $terminator);
    if ($endPos === false) {
        fclose($src); // заголовок длиннее 64КБ — нетипично, безопаснее не трогать файл
        return;
    }
    $headerLen = $endPos + strlen($terminator);
    $header = substr($headBuf, 0, $headerLen);
    $allowed = ['ply', 'format', 'comment', 'element', 'property', 'end_header'];
    $kept = [];
    $changed = false;
    foreach (explode("\n", rtrim($header, "\n")) as $line) {
        $firstWord = strtok($line, ' ');
        if (in_array($firstWord, $allowed, true)) {
            $kept[] = $line;
        } else {
            $changed = true; // строка типа "obj_info ..." — выкидываем
        }
    }
    if (!$changed) {
        fclose($src); // обычный путь для всех "нормальных" файлов — заголовок уже чист
        return;
    }

    $tmpPath = $absolutePath . '.headerfix.tmp';
    $dst = fopen($tmpPath, 'wb');
    if (!$dst) {
        fclose($src);
        return;
    }
    fwrite($dst, implode("\n", $kept) . "\n");
    fwrite($dst, substr($headBuf, $headerLen)); // хвост уже прочитанного 64КБ-буфера
    while (!feof($src)) {
        fwrite($dst, fread($src, 4 * 1024 * 1024));
    }
    fclose($src);
    fclose($dst);
    unlink($absolutePath);
    rename($tmpPath, $absolutePath);
}
