-- Схема PostgreSQL для системы мониторинга базовых станций (South Net Reference Station)
--
-- Скрипт НЕ создаёт базу данных — таблицы создаются в той БД, к которой
-- подключен клиент. Запускайте через psql:
--   psql -U ваш_пользователь -d ваша_база -f sql/schema.sql
-- либо через веб-интерфейс (phpPgAdmin/pgAdmin) — выбрать базу, открыть SQL,
-- вставить и выполнить.
--
-- Булевы флаги (is_enabled, is_active, is_default, is_cancelled) сделаны
-- SMALLINT (0/1), а не native BOOLEAN — PDO_PGSQL возвращает boolean как
-- строки 't'/'f', а 'f' в PHP truthy, это тихо ломает существующие проверки
-- вида $row['is_enabled'] ? ... — поэтому сознательно остаёмся на 0/1.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- нужно для digest()/encode() — аналог MySQL SHA2() в ручных SQL-вставках (см. README)

-- ---------------------------------------------------------------------------
-- Пользователи, синхронизированные из E_Ser190905.mdb (NRS_SER_UserDB)
-- Источник истины — mdb. Эта таблица только зеркало для быстрой авторизации.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users_sync (
  id            INT PRIMARY KEY,            -- ID из mdb (NRS_SER_UserDB.ID)
  user_name     VARCHAR(64) NOT NULL,
  gl_name       VARCHAR(64) NULL,
  user_password VARCHAR(128) NOT NULL,       -- пароль как в mdb (не хэшируем, чтобы не сломать сверку)
  user_time     BIGINT NOT NULL DEFAULT 0,   -- остаток "времени" доступа из mdb (USERTIME)
  puser_time    BIGINT NOT NULL DEFAULT 0,
  scope_name    VARCHAR(64) NULL,
  mount_name    VARCHAR(64) NULL,
  device_type   VARCHAR(64) NULL,
  sn            VARCHAR(64) NULL,
  email         VARCHAR(128) NULL,
  contact_person VARCHAR(128) NULL,
  telephone     VARCHAR(64) NULL,
  is_active     SMALLINT NOT NULL DEFAULT 1, -- USERTIME > 0
  synced_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_name UNIQUE (user_name)
);

CREATE OR REPLACE FUNCTION set_synced_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.synced_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_sync_synced_at ON users_sync;
CREATE TRIGGER trg_users_sync_synced_at BEFORE UPDATE ON users_sync
  FOR EACH ROW EXECUTE FUNCTION set_synced_at();

-- ---------------------------------------------------------------------------
-- Сотрудники кабинета (управление станциями/сотрудниками/подписками, не
-- связаны с mdb). role='admin' — полный доступ, role='viewer' — только
-- просмотр (карта, RINEX). password_hash = SHA2-256 в hex (через PHP
-- hash('sha256', ...) при создании из bin/create_admin.php или
-- invite_accept.php; либо вручную через SQL — см. README, используется
-- digest(...,'sha256')/encode(...,'hex') из pgcrypto).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  login         VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(128) NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'viewer')),
  email         VARCHAR(128) NULL,
  phone         VARCHAR(64) NULL,
  is_active     SMALLINT NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_admin_login UNIQUE (login)
);

-- ---------------------------------------------------------------------------
-- Приглашения сотрудников (страница "Сотрудники → Приглашения" в кабинете).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_invites (
  id          SERIAL PRIMARY KEY,
  token       VARCHAR(64) NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  email       VARCHAR(128) NULL,
  full_name   VARCHAR(128) NULL,
  created_by  INT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMP NOT NULL,
  used_at     TIMESTAMP NULL,
  CONSTRAINT uq_invite_token UNIQUE (token),
  CONSTRAINT fk_invite_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------------
-- Профили подключения к внешним PostgreSQL/PostGIS-серверам (страница
-- "Подключения БД") — куда можно выгрузить копию 3DGS-модели (см. tours.php).
-- Пароль хранится в открытом виде — тот же уровень защиты, что и
-- stations.ntrip_password; страница доступна только role='admin'.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pg_connections (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(64) NOT NULL,
  host        VARCHAR(255) NOT NULL,
  port        INT NOT NULL DEFAULT 5432,
  dbname      VARCHAR(128) NOT NULL,
  username    VARCHAR(128) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  sslmode     VARCHAR(20) NOT NULL DEFAULT 'prefer',
  is_default  SMALLINT NOT NULL DEFAULT 0,
  created_by  INT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_pg_conn_name UNIQUE (name),
  CONSTRAINT fk_pgconn_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pg_connections_updated_at ON pg_connections;
CREATE TRIGGER trg_pg_connections_updated_at BEFORE UPDATE ON pg_connections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Подписки клиентов RTK (страница "Подписки", доступна только role='admin').
-- Полностью отдельно от users_sync.user_time (то приходит из mdb и
-- перезатирается при каждом запуске bin/sync_mdb_users.php) — статус
-- подписки считается только по датам/is_cancelled в этой таблице.
-- У одного пользователя может быть несколько записей (история продлений) —
-- действующая подписка — самая свежая по ends_at, у которой is_cancelled = 0
-- и ends_at > NOW().
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL,
  plan_name     VARCHAR(64) NULL,
  starts_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  ends_at       TIMESTAMP NOT NULL,
  is_cancelled  SMALLINT NOT NULL DEFAULT 0,
  note          VARCHAR(255) NULL,
  created_by    INT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES users_sync(id) ON DELETE CASCADE,
  CONSTRAINT fk_sub_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sub_user ON subscriptions (user_id, ends_at);

-- ---------------------------------------------------------------------------
-- 3DGS-туры (виртуальные туры Gaussian Splatting) — метки на карте, отдельные
-- от станций. Файлы моделей лежат в uploads/tours/ (см. tours.php).
-- pg_connection_id/pg_synced_at/pg_sync_error — статус выгрузки копии тура во
-- внешний PostGIS-профиль (см. pg_connections выше, action=sync_pg в tours.php).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tours (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(128) NOT NULL,
  description     VARCHAR(500) NULL,
  lat             DECIMAL(10,7) NOT NULL,
  lon             DECIMAL(10,7) NOT NULL,
  file_path       VARCHAR(255) NOT NULL,   -- относительный путь внутри uploads/tours/
  file_format     VARCHAR(10) NOT NULL DEFAULT 'ksplat' CHECK (file_format IN ('ply', 'splat', 'ksplat')),
  is_enabled      SMALLINT NOT NULL DEFAULT 1,
  pg_connection_id INT NULL,
  pg_synced_at    TIMESTAMP NULL,
  pg_sync_error   VARCHAR(255) NULL,
  created_by      INT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_tour_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL,
  CONSTRAINT fk_tour_pg_connection FOREIGN KEY (pg_connection_id) REFERENCES pg_connections(id) ON DELETE SET NULL
);

-- Дополнительные файлы тура, когда модель состоит из нескольких .ply/.splat/
-- .ksplat кусков одного скана в общей системе координат (tours.file_path —
-- первый/основной файл, эта таблица — все остальные). Просмотрщик в map.php
-- грузит их все одновременно через GaussianSplats3D.Viewer.addSplatScenes().
CREATE TABLE IF NOT EXISTS tour_files (
  id          SERIAL PRIMARY KEY,
  tour_id     INT NOT NULL,
  file_path   VARCHAR(255) NOT NULL,
  file_format VARCHAR(10) NOT NULL CHECK (file_format IN ('ply', 'splat', 'ksplat', 'las')),
  sort_order  INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_tour_file_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_tour_files_tour ON tour_files (tour_id, sort_order);

-- Чтобы добавить 'las' в существующую (уже созданную ранее) tours.file_format,
-- именованного CHECK не было — Postgres сам назвал его по умолчанию
-- <таблица>_<колонка>_check. Если этот ALTER упадёт с "constraint does not
-- exist", узнайте реальное имя через \d tours (psql) и подставьте его.
ALTER TABLE tours DROP CONSTRAINT IF EXISTS tours_file_format_check;
ALTER TABLE tours ADD CONSTRAINT tours_file_format_check CHECK (file_format IN ('ply', 'splat', 'ksplat', 'las'));

-- Группы туров — ручной выбор при создании/редактировании тура (не
-- автоматическая категоризация). Нужны по двум причинам: (1) список туров
-- предполагается растущим до десятков/сотен крупных облаков, плоский
-- список перестаёт быть удобным; (2) файлы на диске организуются по той же
-- группе (подпапка uploads/tours/<group-slug>/...), чтобы хранилище не
-- превращалось в одну гигантскую плоскую папку.
CREATE TABLE IF NOT EXISTS tour_groups (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(128) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE tours ADD COLUMN IF NOT EXISTS group_id INT NULL;
ALTER TABLE tours DROP CONSTRAINT IF EXISTS fk_tour_group;
ALTER TABLE tours ADD CONSTRAINT fk_tour_group FOREIGN KEY (group_id) REFERENCES tour_groups(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tours_group ON tours (group_id);

-- created_by (см. выше) — FK на admins, заполняется только когда тур
-- создан через админский /tours.php или через /tour_user_upload.php
-- залогиненным как admin/viewer. Для обычных пользователей mdb
-- (users_sync, у них нет совместимого id с admins) нужна ОТДЕЛЬНАЯ
-- колонка — иначе "Мои туры" (my_tours.php) не сможет понять, какие
-- туры принадлежат конкретному mdb-пользователю.
ALTER TABLE tours ADD COLUMN IF NOT EXISTS created_by_user_id INT NULL;
ALTER TABLE tours DROP CONSTRAINT IF EXISTS fk_tour_user;
ALTER TABLE tours ADD CONSTRAINT fk_tour_user FOREIGN KEY (created_by_user_id) REFERENCES users_sync(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tours_created_by_user ON tours (created_by_user_id);

-- is_public — тур доступен БЕЗ логина по прямой ссылке (tour_view.php,
-- см. app/lib/tours.php/tour_is_public()). Отдельно от is_enabled (та
-- управляет видимостью на карте для ЗАЛОГИНЕННЫХ) — публикация не должна
-- тихо задеть карту, и наоборот; отключение тура (is_enabled=0) всегда
-- отзывает и публичный доступ, даже если is_public остался 1.
ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_public SMALLINT NOT NULL DEFAULT 0;

-- tours.slam_scan_id (FK на slam_scans) добавляется НИЖЕ, в разделе
-- "SLAM-обработка" — slam_scans создаётся только там, а FK не может
-- ссылаться на ещё не существующую таблицу.

-- ---------------------------------------------------------------------------
-- Слои и аннотации (точки/линии/полигоны), нарисованные пользователем прямо
-- на 3D-модели тура в map.php. Координаты — в локальном пространстве модели
-- (там же, где работает рейкастинг GaussianSplats3D), не геокоординаты.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tour_layers (
  id          SERIAL PRIMARY KEY,
  tour_id     INT NOT NULL,
  name        VARCHAR(64) NOT NULL,
  color       VARCHAR(7) NOT NULL DEFAULT '#ff3b30',
  is_visible  SMALLINT NOT NULL DEFAULT 1,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_layer_tour FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tour_annotations (
  id          SERIAL PRIMARY KEY,
  layer_id    INT NOT NULL,
  geom_type   VARCHAR(10) NOT NULL CHECK (geom_type IN ('point', 'polyline', 'polygon')),
  coordinates TEXT NOT NULL,   -- JSON [[x,y,z], ...] в локальном пространстве модели (после rotation)
  label       VARCHAR(128) NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_annotation_layer FOREIGN KEY (layer_id) REFERENCES tour_layers(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_annotations_layer ON tour_annotations (layer_id);

-- ---------------------------------------------------------------------------
-- Базовые станции — конфигурация подключения (NTRIP), создаётся вручную
-- через страницу администрирования. В mdb такого справочника нет.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stations (
  id            SERIAL PRIMARY KEY,
  external_id   INT NULL,                    -- ID станции в исходной mdb (NRS_NET_StationInfo_*.ID), для идемпотентного импорта
  station_code  VARCHAR(32) NULL,            -- StationID из mdb (короткий код станции)
  name          VARCHAR(128) NOT NULL,
  host          VARCHAR(255) NOT NULL,
  port          INT NOT NULL DEFAULT 2101,
  mountpoint    VARCHAR(128) NOT NULL,
  ntrip_user    VARCHAR(128) NULL,
  ntrip_password VARCHAR(128) NULL,
  lat           DECIMAL(10,7) NOT NULL,
  lon           DECIMAL(10,7) NOT NULL,
  ecef_x        DECIMAL(12,4) NULL,
  ecef_y        DECIMAL(12,4) NULL,
  ecef_z        DECIMAL(12,4) NULL,
  rinex_path    VARCHAR(255) NULL,           -- опционально: подпапка станции в E:\Ftp\RINEX\RINEX\2026
  comment       VARCHAR(255) NULL,
  is_enabled    SMALLINT NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_external_id UNIQUE (external_id)
);
CREATE INDEX IF NOT EXISTS idx_host_mount ON stations (host, port, mountpoint); -- НЕ уникальный: несколько станций могут отдаваться через один relay-mount

DROP TRIGGER IF EXISTS trg_stations_updated_at ON stations;
CREATE TRIGGER trg_stations_updated_at BEFORE UPDATE ON stations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Текущий статус станции (одна строка на станцию, обновляется поллером)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS station_status (
  station_id    INT PRIMARY KEY,
  status        VARCHAR(10) NOT NULL DEFAULT 'unknown' CHECK (status IN ('online', 'offline', 'unknown')),
  last_check_at TIMESTAMP NULL,
  last_data_at  TIMESTAMP NULL,               -- когда последний раз реально шли байты потока
  bytes_received INT NOT NULL DEFAULT 0,     -- байт принято за последнюю проверку
  last_error    VARCHAR(255) NULL,
  CONSTRAINT fk_status_station FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- Пользователи, добавленные вручную через веб-форму (не из MDB).
-- is_manual = 1: при синхронизации из MDB эта строка не перезатирается.
ALTER TABLE users_sync ADD COLUMN IF NOT EXISTS is_manual SMALLINT NOT NULL DEFAULT 0;

-- Услуги, доступные обычному пользователю сверх базового кабинета
-- (Карта/Мои туры) — см. users.php ("Услуги"), facade_cad.php. Админам
-- инструменты доступны всегда, флаг только для users_sync.
ALTER TABLE users_sync ADD COLUMN IF NOT EXISTS facade_cad_enabled SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE users_sync ADD COLUMN IF NOT EXISTS topo_cad_enabled SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE users_sync ADD COLUMN IF NOT EXISTS facade_foto_enabled SMALLINT NOT NULL DEFAULT 0;

-- Резервный канал определения статуса — по наличию свежих файлов в
-- каталоге станции на ftp://gnss.host (см. bin/poll_stations_ftp.php,
-- запускается раз в час, в отличие от NTRIP-опроса раз в минуту).
-- Нужен потому, что часть станций недоступна для прямого NTRIP-опроса
-- по сети с этого сервера (см. историю — некоторые касты блокируют сам
-- TCP-порт), но данные от них всё равно реально доходят до gnss.host
-- через отдельный, не подверженный той же проблеме канал передачи.
ALTER TABLE station_status ADD COLUMN IF NOT EXISTS ftp_checked_at TIMESTAMP NULL;
ALTER TABLE station_status ADD COLUMN IF NOT EXISTS ftp_last_data_at TIMESTAMP NULL;

-- ---------------------------------------------------------------------------
-- История проверок (для графиков/диагностики, можно чистить по cron)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS station_log (
  id            BIGSERIAL PRIMARY KEY,
  station_id    INT NOT NULL,
  checked_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  status        VARCHAR(10) NOT NULL CHECK (status IN ('online', 'offline', 'unknown')),
  bytes_received INT NOT NULL DEFAULT 0,
  error_message VARCHAR(255) NULL,
  CONSTRAINT fk_log_station FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_station_time ON station_log (station_id, checked_at);

-- ---------------------------------------------------------------------------
-- Фоновые запросы RINEX-данных с gnss.host (rinex.php -> rinex_requests.php,
-- сборка в bin/process_rinex_requests.php). Пользователь описывает, что
-- хочет (станции/диапазон дат-часов UTC/типы файлов/объединять ли часы в
-- сутки) — сборка и слияние файлов происходит в фоне, готовый архив
-- появляется в разделе "Готовые данные".
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rinex_requests (
  id            SERIAL PRIMARY KEY,
  created_by    INT NULL,
  stations      VARCHAR(500) NOT NULL,        -- через запятую, коды станций
  date_from_utc TIMESTAMP NOT NULL,           -- включительно, UTC, с точностью до часа
  date_to_utc   TIMESTAMP NOT NULL,           -- включительно, UTC
  want_obs      SMALLINT NOT NULL DEFAULT 1,  -- наблюдения (_MO)
  want_nav      SMALLINT NOT NULL DEFAULT 1,  -- навигация (_MN)
  merge_by_day  SMALLINT NOT NULL DEFAULT 1,  -- объединять часы в один файл за сутки
  status        VARCHAR(12) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'error')),
  result_path   VARCHAR(255) NULL,            -- относительный путь готового .zip внутри uploads/rinex_results/
  file_count    INT NULL,                     -- сколько файлов попало в архив (для отображения в списке)
  error_message VARCHAR(500) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at    TIMESTAMP NULL,
  completed_at  TIMESTAMP NULL,
  CONSTRAINT fk_rinex_request_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_rinex_requests_status ON rinex_requests (status, created_at);
CREATE INDEX IF NOT EXISTS idx_rinex_requests_creator ON rinex_requests (created_by, created_at);

-- ---------------------------------------------------------------------------
-- SLAM-обработка (перенос движка slamcloude в интерфейс gisdata — см.
-- docs/SLAM_PIPELINE.md). Прямой аналог схемы slamcloude
-- (backend/app/models.py: Project/Scan/ScanInput/Job/ProcessedAsset), в
-- конвенциях gisdata (SMALLINT вместо bool-enum, VARCHAR+CHECK вместо
-- native enum — см. комментарий про булевы флаги в начале файла). Данные с
-- прошлых обработок (архивы/bag-файлы/готовые облака slamcloude) НЕ
-- переносятся — переносится только код/логика пайплайна, эти таблицы
-- обслуживают только новые сканы, загруженные уже через gisdata.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS slam_projects (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(128) NOT NULL,
  -- Целевая CRS для георефренсинга (см. slam/steps/georeference.mjs) —
  -- переопределяет автовычисление зоны WGS84 UTM по RTK-координатам.
  -- target_crs_wkt приоритетнее target_crs_epsg (для локальных проекций
  -- без кода EPSG, например вендорской FusionCRS_TM_87 у SHARE S20).
  target_crs_epsg INT NULL,
  target_crs_wkt  TEXT NULL,
  created_by      INT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_slam_project_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS slam_scans (
  id                 SERIAL PRIMARY KEY,
  project_id         INT NOT NULL,
  name               VARCHAR(128) NOT NULL,
  status             VARCHAR(12) NOT NULL DEFAULT 'uploaded'
                       CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  raw_file_path      VARCHAR(255) NULL,   -- относительный путь ZIP/bag внутри uploads/slam/
  bag_lidar_enabled  SMALLINT NOT NULL DEFAULT 1, -- S20 всегда пишет ROS1 bag (см. план — PCD-путь оставлен для совместимости, но не используется)
  rtk_fixed          SMALLINT NULL,       -- заполняется PPK_CORRECTION/GEOREFERENCE
  -- Ручной обход GEOREFERENCE: на некоторых съёмках бортовой GPS (NavSatFix,
  -- без RTK-FIXED gate — см. slam/steps/decodeRaw.mjs) недостаточно точен
  -- даже после фильтрации выбросов и жёсткого выравнивания — точнее оставить
  -- облако в локальных SLAM-координатах, чем привязывать его к плохой
  -- абсолютной системе. См. slam_scans.php (переключатель) и
  -- slam/steps/georeference.mjs (при включённом флаге — чистый pass-through).
  skip_georeference  SMALLINT NOT NULL DEFAULT 0,
  num_points         BIGINT NULL,
  source_format      VARCHAR(16) NULL,
  crs_epsg           INT NULL,
  -- Proj4-строка CRS результата georeference (не всегда есть EPSG-код —
  -- автовычисленная зона UTM собирается как голая proj4-строка, см.
  -- slam/steps/georeference.mjs buildUtmProjection). Промежуточные LAZ-файлы
  -- пайплайна НЕ хранят CRS сами по себе (slam/lib/lasIO.mjs — минимальный
  -- писатель без VLR), поэтому CRS передаётся отдельно и используется
  -- build_octree.mjs при финальной сборке COPC (--writers.copc.a_srs).
  crs_proj4          VARCHAR(500) NULL,
  bbox_min_lon       DOUBLE PRECISION NULL, -- вместо PostGIS geometry(POLYGON,4326) — bbox 4 числами,
  bbox_min_lat       DOUBLE PRECISION NULL, -- этого достаточно для попапа на карте, отдельный PostGIS-тип не нужен
  bbox_max_lon       DOUBLE PRECISION NULL,
  bbox_max_lat       DOUBLE PRECISION NULL,
  error_message      VARCHAR(500) NULL,
  created_by         INT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_slam_scan_project FOREIGN KEY (project_id) REFERENCES slam_projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_slam_scan_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_slam_scans_project ON slam_scans (project_id, created_at);
ALTER TABLE slam_scans ADD COLUMN IF NOT EXISTS skip_georeference SMALLINT NOT NULL DEFAULT 0;

-- Связь с готовым SLAM-сканом (см. bin/process_slam_jobs.php slam_link_tour()
-- в app/lib/slam.php) — один тур на скан, создаётся/обновляется автоматически
-- по завершении build_octree, чтобы не плодить дубликат записи при
-- повторной обработке того же скана.
ALTER TABLE tours ADD COLUMN IF NOT EXISTS slam_scan_id INT NULL;
ALTER TABLE tours DROP CONSTRAINT IF EXISTS fk_tour_slam_scan;
ALTER TABLE tours ADD CONSTRAINT fk_tour_slam_scan FOREIGN KEY (slam_scan_id) REFERENCES slam_scans(id) ON DELETE SET NULL;
ALTER TABLE tours DROP CONSTRAINT IF EXISTS uq_tour_slam_scan;
ALTER TABLE tours ADD CONSTRAINT uq_tour_slam_scan UNIQUE (slam_scan_id);

-- Вспомогательные входные файлы скана (bag уже внутри raw_file_path/ZIP —
-- остальное извлекается пайплайном в процессе DECODE_RAW и регистрируется
-- здесь: calibration.yaml, camera_frames.zip, frame_pose.txt/SLAM-траектория,
-- RTK/RINEX для PPK). Один тип на скан — как в slamcloude (UNIQUE(scan_id,kind)).
CREATE TABLE IF NOT EXISTS slam_scan_inputs (
  id          SERIAL PRIMARY KEY,
  scan_id     INT NOT NULL,
  kind        VARCHAR(20) NOT NULL CHECK (kind IN (
                'trajectory', 'rover_obs', 'base_rinex', 'nav',
                'rover_ppkraw_bin', 'base_bin', 'frame_pose',
                'project_info', 'calibration', 'camera_frames'
              )),
  file_path   VARCHAR(255) NOT NULL,  -- относительный путь внутри uploads/slam/
  file_size   BIGINT NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_slam_input_scan FOREIGN KEY (scan_id) REFERENCES slam_scans(id) ON DELETE CASCADE,
  CONSTRAINT uq_slam_input_scan_kind UNIQUE (scan_id, kind)
);

-- Один job на шаг пайплайна на скан (PIPELINE_ORDER — см.
-- bin/process_slam_jobs.php): compute_slam -> decode_raw -> filter_outliers
-- -> bin_to_rinex -> ppk_correction -> colorize -> georeference ->
-- build_octree. updated_at — heartbeat детектора зависших job'ов (тот же
-- принцип, что stale-lock в bin/process_copc_conversions.php, но через
-- колонку в БД вместо файла на диске, т.к. шаги SLAM-пайплайна не всегда
-- пишут один растущий выходной файл, за которым можно следить).
CREATE TABLE IF NOT EXISTS slam_jobs (
  id             SERIAL PRIMARY KEY,
  scan_id        INT NOT NULL,
  pipeline_step  VARCHAR(20) NOT NULL CHECK (pipeline_step IN (
                   'compute_slam', 'decode_raw', 'filter_outliers', 'bin_to_rinex',
                   'ppk_correction', 'colorize', 'georeference', 'build_octree'
                 )),
  status         VARCHAR(12) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'processing', 'done', 'error', 'skipped')),
  stall_retries  INT NOT NULL DEFAULT 0,
  error_message  VARCHAR(2000) NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at     TIMESTAMP NULL,
  updated_at     TIMESTAMP NULL,  -- heartbeat, обновляется воркером по ходу выполнения
  finished_at    TIMESTAMP NULL,
  CONSTRAINT fk_slam_job_scan FOREIGN KEY (scan_id) REFERENCES slam_scans(id) ON DELETE CASCADE,
  CONSTRAINT uq_slam_job_scan_step UNIQUE (scan_id, pipeline_step)
);
CREATE INDEX IF NOT EXISTS idx_slam_jobs_status ON slam_jobs (status, created_at);

-- Промежуточные и финальные артефакты по шагам (LAZ на каждом шаге + финальный
-- LAS/COPC) — файлы лежат в uploads/slam/<scan_id>/, путь тут относительный.
CREATE TABLE IF NOT EXISTS slam_processed_assets (
  id          SERIAL PRIMARY KEY,
  scan_id     INT NOT NULL,
  asset_type  VARCHAR(20) NOT NULL CHECK (asset_type IN (
                'intermediate_laz', 'las', 'copc', 'mesh', 'splat'
              )),
  step        VARCHAR(20) NULL, -- для intermediate_laz — какой шаг его произвёл
  file_path   VARCHAR(255) NOT NULL,
  file_size   BIGINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_slam_asset_scan FOREIGN KEY (scan_id) REFERENCES slam_scans(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_slam_assets_scan ON slam_processed_assets (scan_id, asset_type);

-- FACADE·CAD (facade-cad/, встроен через facade_cad.php) — серверное
-- сохранение рабочего состояния вместо localStorage (см. комментарии
-- "localStorage now, server API later" в исходнике инструмента). Одна
-- строка на администратора (MVP: без множественных проектов) — покрывает
-- слои (layers_json, LayerStore.serialize()), начерченную геометрию
-- (entities_json, EntityStore.serialize() — те же JSON-снимки, что уже
-- используются для undo/redo) и список именованных ПСК с активной (ucs_json).
-- cloud_name — только для UI-подсказки (какое облако было загружено), само
-- облако точек не хранится в БД (импортируется заново пользователем).
-- Владелец сессии — ЛИБО админ, ЛИБО обычный пользователь (users_sync,
-- см. users_sync.facade_cad_enabled — доступ обычным пользователям даётся
-- по этому флагу). Раздельные nullable FK вместо одного полиморфного id,
-- потому что admins/users_sync — разные таблицы без общего "person" —
-- CHECK гарантирует ровно одного владельца, частичные UNIQUE-индексы ниже —
-- ровно одну сессию на владельца (MVP: без множественных проектов).
CREATE TABLE IF NOT EXISTS facade_cad_sessions (
  id            SERIAL PRIMARY KEY,
  admin_id      INT NULL,
  user_id       INT NULL,
  cloud_name    VARCHAR(255) NULL,
  layers_json   TEXT NOT NULL DEFAULT '{}',
  ucs_json      TEXT NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_facade_cad_session_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  CONSTRAINT fk_facade_cad_session_user FOREIGN KEY (user_id) REFERENCES users_sync(id) ON DELETE CASCADE,
  CONSTRAINT chk_facade_cad_session_owner CHECK ((admin_id IS NOT NULL) <> (user_id IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_facade_cad_session_admin ON facade_cad_sessions (admin_id) WHERE admin_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_facade_cad_session_user ON facade_cad_sessions (user_id) WHERE user_id IS NOT NULL;

-- Начерченная геометрия — НАСТОЯЩИЙ PostGIS geometry (не JSON-блоб): один
-- ряд на CAD-объект, а не один блоб на сессию, — включает пространственные
-- запросы (bbox/nearest) через GiST-индекс. geom без ограничения типа/SRID
-- (координаты локальные, UCS-метры, не геодезические — SRID здесь не
-- нужен): polyline → LINESTRING как есть (closed — отдельным флагом в
-- extra, без авто-замыкания кольца, чтобы не терять точность), у
-- circle/arc/ellipse/text/point «геометрия» — их якорная точка (center или
-- anchor) как POINT, а все параметрические поля (радиус, углы, текст,
-- высота, поворот, подпись) — в extra (JSONB), т.к. у PostGIS нет
-- примитива "окружность"/"эллипс" в geometry-модели.
CREATE TABLE IF NOT EXISTS facade_cad_entities (
  id          SERIAL PRIMARY KEY,
  session_id  INT NOT NULL,
  kind        VARCHAR(4) NOT NULL CHECK (kind IN ('pl', 'ci', 'ar', 'el', 'tx', 'pt')),
  layer       VARCHAR(64) NOT NULL DEFAULT '0',
  geom        GEOMETRY NOT NULL,
  extra       JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_facade_cad_entity_session FOREIGN KEY (session_id) REFERENCES facade_cad_sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_facade_cad_entities_session ON facade_cad_entities (session_id);
CREATE INDEX IF NOT EXISTS idx_facade_cad_entities_geom ON facade_cad_entities USING GIST (geom);

-- TOPO·CAD — второй CAD-инструмент (github.com/skandmataisabella1357-beep/CtF,
-- папка CtFT/), тот же движок/EntityJSON-контракт, что у FACADE·CAD (см.
-- facade-cad/topo-cad/), поэтому схема хранения буквально зеркало
-- facade_cad_sessions/facade_cad_entities выше — см. их докстринги для
-- обоснования полиморфного владельца и per-entity PostGIS geometry.
-- Доступ обычным пользователям — по отдельному флагу
-- users_sync.topo_cad_enabled (не переиспользуем facade_cad_enabled: это
-- разные услуги, у пользователя может быть включена одна без другой).
CREATE TABLE IF NOT EXISTS topo_cad_sessions (
  id            SERIAL PRIMARY KEY,
  admin_id      INT NULL,
  user_id       INT NULL,
  cloud_name    VARCHAR(255) NULL,
  layers_json   TEXT NOT NULL DEFAULT '{}',
  ucs_json      TEXT NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_topo_cad_session_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  CONSTRAINT fk_topo_cad_session_user FOREIGN KEY (user_id) REFERENCES users_sync(id) ON DELETE CASCADE,
  CONSTRAINT chk_topo_cad_session_owner CHECK ((admin_id IS NOT NULL) <> (user_id IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_topo_cad_session_admin ON topo_cad_sessions (admin_id) WHERE admin_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_topo_cad_session_user ON topo_cad_sessions (user_id) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS topo_cad_entities (
  id          SERIAL PRIMARY KEY,
  session_id  INT NOT NULL,
  kind        VARCHAR(4) NOT NULL CHECK (kind IN ('pl', 'ci', 'ar', 'el', 'tx', 'pt')),
  layer       VARCHAR(64) NOT NULL DEFAULT '0',
  geom        GEOMETRY NOT NULL,
  extra       JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_topo_cad_entity_session FOREIGN KEY (session_id) REFERENCES topo_cad_sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_topo_cad_entities_session ON topo_cad_entities (session_id);
CREATE INDEX IF NOT EXISTS idx_topo_cad_entities_geom ON topo_cad_entities USING GIST (geom);

-- FACADE·FOTO — ректификация фасада по контрольным точкам (facade-foto/
-- index.html, самодостаточный HTML-инструмент, чертёж+историческое фото
-- совмещаются гомографией). В отличие от FACADE·CAD/TOPO·CAD здесь нет
-- реальной геометрии для PostGIS — контрольные точки существуют в
-- пиксельных координатах чертежа/фото, а не в системе координат объекта —
-- поэтому сессия целиком хранится как JSONB (те же поля, что инструмент
-- уже сохранял в скачиваемый facade_session.json: points/k1/k2/mmPerPx/
-- target/source), без отдельной таблицы сущностей. Тот же полиморфный
-- владелец (admin_id/user_id), что у facade_cad_sessions — см. её
-- докстринг для обоснования.
CREATE TABLE IF NOT EXISTS facade_foto_sessions (
  id            SERIAL PRIMARY KEY,
  admin_id      INT NULL,
  user_id       INT NULL,
  session_json  JSONB NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_facade_foto_session_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  CONSTRAINT fk_facade_foto_session_user FOREIGN KEY (user_id) REFERENCES users_sync(id) ON DELETE CASCADE,
  CONSTRAINT chk_facade_foto_session_owner CHECK ((admin_id IS NOT NULL) <> (user_id IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_facade_foto_session_admin ON facade_foto_sessions (admin_id) WHERE admin_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_facade_foto_session_user ON facade_foto_sessions (user_id) WHERE user_id IS NOT NULL;
