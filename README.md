# Мониторинг базовых станций (South Net Reference Station)

Стек: PHP + PostgreSQL + JS (Leaflet), под XAMPP на Windows.

## Структура

- `.env` — настройки базы данных и пути к mdb (см. `.env.example`; `.env` в git не коммитится).
- `app/config.php` — настройки приложения (RINEX, параметры опроса NTRIP, сессия); PostgreSQL/mdb подтягиваются из `.env` через `app/lib/env.php`. Локальные переопределения — в `app/config.local.php` (в git не коммитить).
- `app/lib/db.php` — подключения к PostgreSQL (`db()` — основная БД приложения, `pg()` — внешние профили PostGIS из `pg_connections`) и к исходной Access-базе (`mdb()`).
- `app/lib/auth.php` — сессии и проверка логина по таблице `users_sync`.
- `sql/schema.sql` — схема PostgreSQL: `users_sync`, `admins`, `admin_invites`, `pg_connections`, `subscriptions`, `tours`, `tour_groups`, `stations`, `station_status`, `station_log`, `rinex_requests`.
- `bin/sync_mdb_users.php` — синхронизация пользователей из `E_Ser190905.mdb` (таблица `NRS_SER_UserDB`) в PostgreSQL. Запускать по расписанию.
- `bin/poll_stations.php` — опрос всех включённых станций как NTRIP-клиент, запись статуса в `station_status`/`station_log`. Запускать по расписанию (например, раз в минуту).
- `bin/poll_stations_ftp.php` — резервная проверка статуса по наличию свежих файлов станции на `ftp://gnss.host` (см. `app/lib/gnss_ftp.php`). Только повышает offline/unknown → online, никогда не понижает — NTRIP-опрос (выше) обновляется чаще и сам ловит реальные обрывы. Запускать по расписанию раз в час.
- `login.php`, `logout.php` — вход/выход.
- `stations.php` — администрирование станций (добавление NTRIP-подключения, lat/lon).
- `map.php` + `api/stations_status.php` — карта Leaflet с автообновлением статуса станций.
- `rinex.php`, `rinex_download_zip.php` — поиск RINEX-файлов на `ftp://gnss.host` по станциям/периоду (UTC, с точностью до часа)/типу (наблюдения/навигация) и мгновенное скачивание выбранных файлов одним ZIP-архивом. Креды — `GNSS_FTP_HOST`/`GNSS_FTP_USER`/`GNSS_FTP_PASSWORD` в `.env`.
- `rinex_requests.php`, `rinex_request_download.php`, `bin/process_rinex_requests.php` — фоновые запросы RINEX (та же страница `rinex.php`, кнопка «Сформировать фоновый запрос»): сборка и объединение смежных часовых файлов в файл за сутки происходит на сервере в фоне (см. `app/lib/rinex_merge.php` — склейка только идущих подряд файлов, разрыв в несколько минут начинает новый файл), результат — в разделе «Готовые данные». Запускать `bin/process_rinex_requests.php` по расписанию раз в 1–2 минуты.

## Источники данных по базовым станциям

Обследованы три mdb-файла:

- `E_Ser190905.mdb` (South Net Reference Station) — справочник пользователей/лицензий (`NRS_SER_UserDB`, 332 строки). Используется для авторизации (см. `bin/sync_mdb_users.php`). Никакого списка станций там нет.
- `EagleServerR160321.mdb` — пустой установочный шаблон (только системные таблицы Access), данных нет.
- `E_Net20220422.mdb` — реальная конфигурация сети станций. Таблица `NRS_NET_StationInfo_220402` (24 станции) содержит NTRIP-подключение (`ClientIp`/`ClientPort`/`ClientMount`/`ClientName`/`ClientPassword`) и координаты ECEF (`X`,`Y`,`Z`, метры). Импортируется в PostgreSQL скриптом `bin/import_net_stations.php`.

Важно: несколько станций в `E_Net20220422.mdb` указывают на один и тот же `ClientIp:ClientPort/ClientMount` (например, `212.220.202.178:19003/KOUR` отдаёт поток сразу для KOUR, BSRT, PLSK, TOUR, KMNS, ARTI, BGDN, PRVU, EKB1, ARTM, ALAP, IVDL — релейная сеть). Поэтому в таблице `stations` уникальность не по host+port+mountpoint, а по `external_id` (ID станции в исходной mdb).

Импорт:
```
php bin\import_net_stations.php "C:\path\to\E_Net20220422.mdb"
```
Координаты переводятся из ECEF в широту/долготу методом Bowring (см. `ecef_to_lat_lon()` в скрипте) для отображения на карте Leaflet.

## Установка на XAMPP

1. Создать БД и прогнать схему: `psql -U postgres -d gisdata -f sql\schema.sql`
   (либо через веб-интерфейс типа phpPgAdmin/pgAdmin — выбрать базу, открыть
   SQL-вкладку, вставить содержимое файла и выполнить).
2. Скопировать `.env.example` в `.env` и указать реальные данные PostgreSQL (`PGSQL_HOST`, `PGSQL_DATABASE`, `PGSQL_USER`, `PGSQL_PASSWORD`) и путь к mdb (`MDB_PATH`).
3. Включить в `php.ini` расширение `pdo_odbc` (нужно для синхронизации с mdb). Разрядность PHP должна совпадать с разрядностью установленного Microsoft Access Database Engine (Access Database Engine Redistributable).
4. Положить проект в `htdocs\gisdata` (или настроить VirtualHost на корень репозитория).
5. Выполнить разово: `php bin\sync_mdb_users.php` — проверить, что пользователи подгрузились.
6. Настроить в Планировщике заданий Windows четыре задания:
   - `php bin\sync_mdb_users.php` — каждые 5–15 минут;
   - `php bin\poll_stations.php` — каждую 1 минуту;
   - `php bin\poll_stations_ftp.php` — раз в час;
   - `php bin\process_rinex_requests.php` — каждую 1–2 минуты.

   Если на хостинге нет CLI и cron дёргает URL (как на shared-хостинге типа
   ispmanager/cPanel), задайте `CRON_TOKEN` в `.env` и вызывайте:
   `https://ваш-домен/bin/poll_stations.php?token=<CRON_TOKEN>` — без CLI
   и без верного токена скрипты отвечают 403 (защита от посторонних запросов).
7. Открыть `http://localhost/gisdata/login.php`, войти под одним из пользователей mdb, добавить станции на странице «Станции».

## Суперпользователь (управление станциями)

Управление станциями (`stations.php`) доступно только суперпользователям —
отдельная таблица `admins`, не связанная с mdb. Пароль хранится как
SHA2-256 (hex), что позволяет создать запись либо через CLI:

```
php bin\create_admin.php admin "СтрогийПароль123" "Имя Фамилия"
```

либо одним SQL-запросом без PHP (например, через phpPgAdmin/pgAdmin на
хостинге; требует расширение `pgcrypto`, оно подключается в `schema.sql`):

```sql
INSERT INTO admins (login, password_hash, full_name, is_active)
VALUES ('admin', encode(digest('СтрогийПароль123', 'sha256'), 'hex'), NULL, 1)
ON CONFLICT (login) DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = 1;
```

либо через браузер, если на хостинге нет ни SSH, ни phpMyAdmin под рукой —
сначала задайте `SETUP_TOKEN` в `.env` (любая длинная случайная строка), затем откройте:

```
https://ваш-домен/bin/create_admin.php?token=<SETUP_TOKEN>&login=admin&password=СтрогийПароль123
```

Без верного `token` скрипт отвечает 403. После создания администратора
стоит удалить `bin/create_admin.php` с сервера или сменить `SETUP_TOKEN`.

Повторный запуск с тем же логином обновит пароль (смена пароля). Вход — на
`/admin_login.php`, отдельно от обычного входа пользователей mdb (`/login.php`).
Сессии суперпользователя и обычного пользователя не пересекаются.

## Логин/авторизация

Доступ к карте, странице станций и RINEX — только после входа. Логины и пароли берутся из `NRS_SER_UserDB` (поле `USERPASSWORD` — как в исходной mdb, без хэширования, чтобы не расходиться с существующей системой). Пользователь считается активным, если `USERTIME > 0`.

## Проверка активности станции

`bin/poll_stations.php` подключается к станции как NTRIP-клиент (`GET /mountpoint`), и считает её "online", только если за `read_timeout_sec` пришло не меньше `min_bytes_online` байт потока (без ошибок `SOURCETABLE`/`401`). Параметры — в `app/config.php` → `ntrip`.
