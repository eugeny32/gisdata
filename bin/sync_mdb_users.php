<?php
declare(strict_types=1);

/**
 * CLI-скрипт синхронизации пользователей из E_Ser190905.mdb (NRS_SER_UserDB)
 * в таблицу MySQL users_sync. Запускать через Планировщик заданий Windows,
 * например раз в 5-15 минут:
 *   php C:\path\to\bin\sync_mdb_users.php
 *
 * mdb — это источник истины для логинов/паролей и срока доступа (USERTIME),
 * страница входа в приложение проверяет уже синхронизированную таблицу MySQL,
 * чтобы не открывать ODBC-соединение на каждый HTTP-запрос.
 */

require __DIR__ . '/../app/lib/db.php';
require __DIR__ . '/../app/lib/cli.php';
require_cli_or_token();

function log_line(string $msg): void
{
    cli_out('[' . date('Y-m-d H:i:s') . '] ' . $msg);
}

try {
    $source = mdb();
    $stmt = $source->query(
        'SELECT ID, UserName, Glname, USERPASSWORD, PUSERTIME, USERTIME, ' .
        'ScopeName, MountName, DeviceType, SN, EMAIL, Contact_person, Telephone ' .
        'FROM NRS_SER_UserDB'
    );
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $e) {
    log_line('ОШИБКА чтения mdb: ' . $e->getMessage());
    exit(1);
}

$pdo = db();
$upsert = $pdo->prepare(
    'INSERT INTO users_sync
        (id, user_name, gl_name, user_password, user_time, puser_time,
         scope_name, mount_name, device_type, sn, email, contact_person, telephone, is_active)
     VALUES
        (:id, :user_name, :gl_name, :user_password, :user_time, :puser_time,
         :scope_name, :mount_name, :device_type, :sn, :email, :contact_person, :telephone, :is_active)
     ON CONFLICT (id) DO UPDATE SET
        user_name = EXCLUDED.user_name,
        gl_name = EXCLUDED.gl_name,
        user_password = EXCLUDED.user_password,
        user_time = EXCLUDED.user_time,
        puser_time = EXCLUDED.puser_time,
        scope_name = EXCLUDED.scope_name,
        mount_name = EXCLUDED.mount_name,
        device_type = EXCLUDED.device_type,
        sn = EXCLUDED.sn,
        email = EXCLUDED.email,
        contact_person = EXCLUDED.contact_person,
        telephone = EXCLUDED.telephone,
        is_active = EXCLUDED.is_active'
);

$pdo->beginTransaction();
$count = 0;
foreach ($rows as $row) {
    $userTime = (int)($row['USERTIME'] ?? 0);
    $upsert->execute([
        'id'             => (int)$row['ID'],
        'user_name'      => (string)$row['UserName'],
        'gl_name'        => $row['Glname'] ?? null,
        'user_password'  => (string)$row['USERPASSWORD'],
        'user_time'      => $userTime,
        'puser_time'     => (int)($row['PUSERTIME'] ?? 0),
        'scope_name'     => $row['ScopeName'] ?? null,
        'mount_name'     => $row['MountName'] ?? null,
        'device_type'    => $row['DeviceType'] ?? null,
        'sn'             => $row['SN'] ?? null,
        'email'          => $row['EMAIL'] ?? null,
        'contact_person' => $row['Contact_person'] ?? null,
        'telephone'      => $row['Telephone'] ?? null,
        'is_active'      => $userTime > 0 ? 1 : 0,
    ]);
    $count++;
}
$pdo->commit();

log_line("Синхронизировано пользователей: $count");
