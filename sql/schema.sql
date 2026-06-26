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
