<?php

declare(strict_types=1);

/**
 * Склейка нескольких часовых RINEX-файлов одной станции/типа в файлы
 * "за сутки" (см. bin/process_rinex_requests.php). Правила:
 *   1) Склеиваем только файлы БЕЗ разрыва между ними — если конец одного
 *      файла (его начало + номинальная длительность из имени) и начало
 *      следующего расходятся больше чем на $gapToleranceMinutes, это два
 *      разных непрерывных отрезка, и из них получаются ДВА отдельных
 *      файла, а не один с дыркой посередине.
 *   2) Склейка никогда не пересекает границу суток (UTC) — даже идущие
 *      впритык файлы 23:00 и 00:00 следующего дня попадут в разные
 *      сутки и не объединятся, по тому же принципу, по которому организован
 *      сам каталог на FTP (один день — одна папка).
 *
 * Объединение самого RINEX-содержимого — построчное: у файла одна шапка до
 * строки "END OF HEADER" (включительно), дальше данные. Для склеенного
 * файла шапка берётся из первого (по времени) файла группы, у всех
 * остальных шапка вырезается целиком, остаются только данные. Работает
 * одинаково для observation- и navigation-файлов — оба формата размечают
 * конец шапки той же меткой "END OF HEADER".
 */

/**
 * Группирует список файлов (каждый — ['local_path', 'timestamp' (DateTimeImmutable),
 * 'period_minutes' (?int)]) на непрерывные отрезки. Файлы должны принадлежать
 * одной станции и одному типу (MO либо MN) — группировка по станции/типу/дню
 * делается ДО вызова этой функции, на уровне bin/process_rinex_requests.php.
 *
 * @return array<int, array<int, array>> список групп, каждая — список файлов в хронологическом порядке
 */
function rinex_group_contiguous_files(array $files, int $gapToleranceMinutes = 5): array
{
    usort($files, fn($a, $b) => $a['timestamp'] <=> $b['timestamp']);

    $groups = [];
    $current = [];
    $expectedNextStart = null;

    foreach ($files as $file) {
        if ($current && $expectedNextStart !== null) {
            $diffMinutes = ($file['timestamp']->getTimestamp() - $expectedNextStart->getTimestamp()) / 60;
            // Разрыв между сутками (день файла отличается от дня группы) тоже
            // обязательно рвёт группу — день в любом случае не пересекаем,
            // независимо от величины разрыва.
            $sameDay = $file['timestamp']->format('Y-m-d') === $current[0]['timestamp']->format('Y-m-d');
            if (!$sameDay || $diffMinutes > $gapToleranceMinutes) {
                $groups[] = $current;
                $current = [];
            }
        }
        $current[] = $file;
        $periodMinutes = $file['period_minutes'] ?? 60; // 60 — разумное умолчание, если токен периода не распознан
        $expectedNextStart = $file['timestamp']->modify("+{$periodMinutes} minutes");
    }
    if ($current) {
        $groups[] = $current;
    }
    return $groups;
}

/**
 * Физическая склейка группы файлов (уже отсортированных хронологически —
 * rinex_group_contiguous_files() это гарантирует) в один новый файл.
 * Группа из ОДНОГО файла — это просто копирование, для единообразия
 * обработки на уровне вызывающего кода (не нужно различать "склеивать или
 * просто скопировать").
 */
function rinex_merge_group(array $localPathsInOrder, string $outputPath): bool
{
    $out = fopen($outputPath, 'wb');
    if ($out === false) {
        return false;
    }
    $headerDone = false;
    foreach ($localPathsInOrder as $path) {
        $in = fopen($path, 'rb');
        if ($in === false) {
            continue;
        }
        $skippingThisFilesHeader = $headerDone; // для первого файла группы — false, шапка пишется целиком
        while (($line = fgets($in)) !== false) {
            if ($skippingThisFilesHeader) {
                if (str_contains($line, 'END OF HEADER')) {
                    $skippingThisFilesHeader = false;
                }
                continue; // не пишем ни одной строки чужой шапки, включая саму строку-метку
            }
            fwrite($out, $line);
            if (!$headerDone && str_contains($line, 'END OF HEADER')) {
                $headerDone = true;
            }
        }
        fclose($in);
    }
    fclose($out);
    return true;
}
