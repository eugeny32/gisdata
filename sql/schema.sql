-- Схема MySQL для системы мониторинга базовых станций (South Net Reference Station)
-- Кодировка utf8mb4, движок InnoDB
--
-- Скрипт НЕ создаёт базу данных и не делает USE — таблицы создаются в той БД,
-- к которой подключен клиент (на shared-хостинге пользователь обычно уже
-- привязан к своей единственной базе и не имеет права CREATE DATABASE).
-- Запускайте так: mysql -u ваш_пользователь -p ваша_база < sql\schema.sql
-- либо выполните импорт через phpMyAdmin, выбрав свою базу перед запуском.

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
  is_active     TINYINT(1) NOT NULL DEFAULT 1, -- USERTIME > 0
  synced_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_name (user_name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Суперпользователи приложения (управление станциями, не связаны с mdb).
-- password_hash = SHA2(пароль, 256) в hex, чтобы запись можно было создать
-- одним SQL-запросом (см. ниже пример INSERT) без доступа к PHP CLI.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  login         VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(128) NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_login (login)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Роли сотрудников и приглашения (страницы "Сотрудники" в кабинете).
-- role='admin' — полный доступ (станции, сотрудники), role='viewer' — только
-- просмотр (карта, RINEX). Существующие записи admins (созданные до этого
-- изменения через bin/create_admin.php) получают role='admin' по умолчанию,
-- права не теряются.
--
-- ВНИМАНИЕ: эти три ALTER не идемпотентны (старые MySQL/MariaDB не понимают
-- ADD COLUMN IF NOT EXISTS) — выполните их ОДИН РАЗ. При повторном запуске
-- получите ошибку "Duplicate column name", это нормально и означает, что
-- колонки уже добавлены — просто пропустите эти 3 строки и продолжайте дальше.
-- ---------------------------------------------------------------------------
ALTER TABLE admins ADD COLUMN role ENUM('admin','viewer') NOT NULL DEFAULT 'admin';
ALTER TABLE admins ADD COLUMN email VARCHAR(128) NULL;
ALTER TABLE admins ADD COLUMN phone VARCHAR(64) NULL;

CREATE TABLE IF NOT EXISTS admin_invites (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  token       VARCHAR(64) NOT NULL,
  role        ENUM('admin','viewer') NOT NULL DEFAULT 'viewer',
  email       VARCHAR(128) NULL,
  full_name   VARCHAR(128) NULL,
  created_by  INT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at  DATETIME NOT NULL,
  used_at     DATETIME NULL,
  UNIQUE KEY uq_invite_token (token),
  CONSTRAINT fk_invite_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Подписки клиентов RTK (страница "Подписки" в кабинете, доступна только
-- role='admin'). Полностью отдельно от users_sync.user_time (то приходит из
-- mdb и перезатирается при каждом запуске bin/sync_mdb_users.php) — статус
-- подписки считается только по датам/is_cancelled в этой таблице,
-- синхронизация с mdb её не трогает. У одного пользователя может быть
-- несколько записей (история продлений) — действующая подписка — самая
-- свежая по ends_at, у которой is_cancelled = 0 и ends_at > NOW().
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  plan_name     VARCHAR(64) NULL,
  starts_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ends_at       DATETIME NOT NULL,
  is_cancelled  TINYINT(1) NOT NULL DEFAULT 0,
  note          VARCHAR(255) NULL,
  created_by    INT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_sub_user (user_id, ends_at),
  CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES users_sync(id) ON DELETE CASCADE,
  CONSTRAINT fk_sub_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Базовые станции — конфигурация подключения (NTRIP), создаётся вручную
-- через страницу администрирования. В mdb такого справочника нет.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
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
  is_enabled    TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_external_id (external_id),
  KEY idx_host_mount (host, port, mountpoint) -- НЕ уникальный: несколько станций могут отдаваться через один relay-mount
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Текущий статус станции (одна строка на станцию, обновляется поллером)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS station_status (
  station_id    INT PRIMARY KEY,
  status        ENUM('online','offline','unknown') NOT NULL DEFAULT 'unknown',
  last_check_at DATETIME NULL,
  last_data_at  DATETIME NULL,               -- когда последний раз реально шли байты потока
  bytes_received INT NOT NULL DEFAULT 0,     -- байт принято за последнюю проверку
  last_error    VARCHAR(255) NULL,
  CONSTRAINT fk_status_station FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- История проверок (для графиков/диагностики, можно чистить по cron)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS station_log (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  station_id    INT NOT NULL,
  checked_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status        ENUM('online','offline','unknown') NOT NULL,
  bytes_received INT NOT NULL DEFAULT 0,
  error_message VARCHAR(255) NULL,
  KEY idx_station_time (station_id, checked_at),
  CONSTRAINT fk_log_station FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
) ENGINE=InnoDB;
