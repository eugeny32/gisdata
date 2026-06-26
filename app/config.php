<?php
// Конфигурация приложения. Настройки базы данных и пути к mdb берутся из
// .env (см. .env.example) — скопируйте .env.example в .env и заполните под
// сервер. Остальные параметры (RINEX, NTRIP, сессия) можно менять прямо тут
// либо переопределять через config.local.php.

require_once __DIR__ . '/lib/env.php';
load_env();

return [
    'pgsql' => [
        'host'     => env('PGSQL_HOST', '127.0.0.1'),
        'port'     => (int)env('PGSQL_PORT', 5432),
        'dbname'   => env('PGSQL_DATABASE', 'gisdata'),
        'user'     => env('PGSQL_USER', 'postgres'),
        'password' => env('PGSQL_PASSWORD', '914999'),
    ],

    // Путь не меняем — путь к исходной базе South Net Reference Station
    'mdb' => [
        'path'   => env('MDB_PATH', 'C:\\Program Files (x86)\\South Net Reference Station\\SBR\\E_SERVER64_230822\\E_Ser190905.mdb'),
        // ODBC-драйвер должен совпадать по разрядности с PHP (см. README в /app)
        'driver' => env('MDB_DRIVER', 'Microsoft Access Driver (*.mdb, *.accdb)'),
    ],

    // Путь не меняем — каталог RINEX-файлов на сервере
    'rinex' => [
        'base_path' => 'E:\\Ftp\\RINEX\\RINEX\\2026',
    ],

    // Удалённый FTP с почасовыми RINEX-файлами станций (см. app/lib/gnss_ftp.php).
    // Структура: /{день_года}({ММДД})/{КОД_СТАНЦИИ}/{...}_MO.rnx|_MN.rnx —
    // без подпапки года, один год на сервере.
    'gnss_ftp' => [
        'host'     => env('GNSS_FTP_HOST', 'gnss.host'),
        'user'     => env('GNSS_FTP_USER', ''),
        'password' => env('GNSS_FTP_PASSWORD', ''),
        'timeout_sec' => 15,
    ],

    // Параметры опроса NTRIP-потоков базовых станций
    'ntrip' => [
        'connect_timeout_sec' => 5,
        'read_timeout_sec'    => 8,
        'min_bytes_online'    => 256, // сколько байт потока считать признаком "станция жива"
        'user_agent'          => 'NTRIP GISDataMonitor/1.0',
    ],

    'session' => [
        'name'     => 'gisdata_sid',
        'lifetime' => 8 * 3600,
    ],

    // Генератор искусственных RINEX (rinex_generate.php) — источники
    // объединённых многосистемных navigation-файлов (broadcast ephemeris,
    // нужны для расчёта орбит GPS/ГЛОНАСС). Пробуются по очереди, пока
    // один не отдаст валидный файл.
    // CDDIS проверен живьём и работает (HTTP Basic Auth логином/паролем
    // Earthdata + переход по 302-редиректу на urs.earthdata.nasa.gov с тем
    // же логином/паролем + cookie-сессия — см. rgen_http_get_authenticated()
    // в NavFile.php). Нужен бесплatный аккаунт на urs.earthdata.nasa.gov,
    // логин/пароль — в .env (CDDIS_EARTHDATA_USER/CDDIS_EARTHDATA_PASSWORD).
    // BKG — НЕ проверен живьём (недоступен из среды разработки, не из
    // реального сервера) — оставлен как анонимный (без логина) запасной
    // вариант, на случай если CDDIS будет недоступен/сменит схему.
    'rinex_synth' => [
        'nav_url_templates' => [
            'https://cddis.nasa.gov/archive/gnss/data/daily/{year}/brdc/BRDC00IGS_R_{year}{doy3}0000_01D_MN.rnx.gz',
            'https://igs.bkg-ev.de/root_ftp/IGS/BRDC/{year}/{doy3}/BRDM00DLR_S_{year}{doy3}0000_01D_MN.rnx.gz',
        ],
        // Точные многосистемные эфемериды (SP3, CODE/AIUB) — кладутся в
        // итоговый архив вместе с broadcast-файлом "для полноты" (не
        // используются в собственном расчёте орбит этого генератора).
        // Порядок — от самого точного к самому свежему: FIN (задержка
        // ~2 недели, мультисистемный MGX) -> RAP (~1 день, "OPS"-вариант —
        // MGX-rapid не публикуется, но проверено, что OPSRAP содержит и G,
        // и R) -> ULT (почти реальное время, менее точный, тоже OPS).
        // Официальный продукт IGS (IGS0OPSFIN) сюда не годится — проверено,
        // он только GPS, без ГЛОНАСС.
        'sp3_url_templates' => [
            'https://cddis.nasa.gov/archive/gnss/products/{gpsweek}/COD0MGXFIN_{year}{doy3}0000_01D_05M_ORB.SP3.gz',
            'https://cddis.nasa.gov/archive/gnss/products/{gpsweek}/COD0OPSRAP_{year}{doy3}0000_01D_05M_ORB.SP3.gz',
            'https://cddis.nasa.gov/archive/gnss/products/{gpsweek}/COD0OPSULT_{year}{doy3}0000_02D_05M_ORB.SP3.gz',
        ],
        'earthdata_user' => env('CDDIS_EARTHDATA_USER'),
        'earthdata_password' => env('CDDIS_EARTHDATA_PASSWORD'),
    ],
];
