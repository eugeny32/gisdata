<?php

declare(strict_types=1);

require_once __DIR__ . '/Constants.php';
require_once __DIR__ . '/NavFile.php';

/**
 * Загрузка точных эфемерид (SP3, многосистемных — GPS+ГЛОНАСС+Galileo+
 * BeiDou) для приложения к итоговому архиву генератора — НЕ используются в
 * собственном расчёте координат спутников (тот идёт по broadcast-эфемеридам,
 * см. GpsNav.php/GlonassNav.php), это просто бонус-файл "для полноты" для
 * последующей пост-обработки за пределами этого генератора.
 *
 * Источник — CDDIS, продукт CODE (AIUB, Бернский университет) "MGX FIN":
 * COD0MGXFIN_<yyyy><ddd>0000_01D_05M_ORB.SP3.gz — подтверждено живым тестом,
 * содержит G+R+E+C. Официальный комбинированный продукт IGS (IGS0OPSFIN) НЕ
 * подходит — проверено, он только GPS, без ГЛОНАСС.
 *
 * Лучшее-из-возможного: финальный (FIN) продукт публикуется с задержкой
 * ~2 недели — для недавних/текущих дат его ещё не существует, поэтому
 * пробуем после него "rapid" (RAP, задержка ~1-2 дня), затем "ultra-rapid"
 * (ULT, почти в реальном времени, но менее точный, частично прогнозный).
 * Если не нашлось ни одного — это не ошибка генерации в целом (SP3
 * опционален), просто в архив он не попадёт.
 */
function rgen_sp3_cache_path(int $dayStartUnix): string
{
    $doy = (int)gmdate('z', $dayStartUnix) + 1;
    $year = (int)gmdate('Y', $dayStartUnix);
    return rgen_nav_cache_dir() . '/sp3_' . $year . '_' . str_pad((string)$doy, 3, '0', STR_PAD_LEFT) . '.sp3';
}

function rgen_download_sp3_for_day(int $dayStartUnix): ?string
{
    $cacheFile = rgen_sp3_cache_path($dayStartUnix);
    if (is_file($cacheFile) && filesize($cacheFile) > 0) {
        return $cacheFile;
    }

    $doy = (int)gmdate('z', $dayStartUnix) + 1;
    $year = (int)gmdate('Y', $dayStartUnix);
    [$gpsWeek] = rgen_utc_to_gps_week_sow($dayStartUnix);

    $cfg = app_config()['rinex_synth'] ?? [];
    $templates = $cfg['sp3_url_templates'] ?? [];
    foreach ($templates as $template) {
        $url = strtr($template, [
            '{year}' => (string)$year,
            '{doy3}' => str_pad((string)$doy, 3, '0', STR_PAD_LEFT),
            '{gpsweek}' => (string)$gpsWeek,
        ]);

        [$user, $pass] = rgen_credentials_for_url($url, $cfg);
        $gz = rgen_http_get($url, $user, $pass);
        if ($gz === null) {
            continue;
        }
        $sp3 = @gzdecode($gz);
        if ($sp3 === false || $sp3 === null) {
            $sp3 = $gz;
        }
        if (!str_starts_with($sp3, '#')) {
            // Валидный SP3 всегда начинается со строки "#c..."/"#d..." —
            // иначе это, скорее всего, страница ошибки/логина.
            continue;
        }
        file_put_contents($cacheFile, $sp3);
        return $cacheFile;
    }

    return null;
}
