"""
Одноразовая генерация sql/data_seed.sql из E_Net20220422.mdb и E_Ser190905.mdb
для импорта через phpMyAdmin (без необходимости поднимать pdo_odbc в PHP).
Логика совпадает с bin/import_net_stations.php и bin/sync_mdb_users.php.

Запуск: python bin\\gen_sql_dump.py
"""
import math
import os
import pyodbc

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def ecef_to_lat_lon(x, y, z):
    a = 6378137.0
    f = 1 / 298.257223563
    e2 = f * (2 - f)
    lon = math.atan2(y, x)
    p = math.sqrt(x * x + y * y)
    lat = math.atan2(z, p * (1 - e2))
    for _ in range(5):
        sin_lat = math.sin(lat)
        n = a / math.sqrt(1 - e2 * sin_lat * sin_lat)
        lat = math.atan2(z + e2 * n * sin_lat, p)
    return math.degrees(lat), math.degrees(lon)


def sql_str(v):
    if v is None:
        return 'NULL'
    s = str(v).strip()
    if s == '':
        return 'NULL'
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def sql_num(v):
    return 'NULL' if v is None else str(v)


def connect(mdb_filename):
    path = os.path.join(BASE, mdb_filename)
    return pyodbc.connect(
        r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};DBQ=' + path
    )


def gen_stations():
    conn = connect('E_Net20220422.mdb')
    cur = conn.cursor()
    cur.execute(
        'SELECT ID, StationName, StationID, StationComment, ClientIp, ClientPort, '
        'ClientName, ClientMount, ClientPassword, X, Y, Z, EStatus '
        'FROM NRS_NET_StationInfo_220402'
    )
    rows = cur.fetchall()
    conn.close()

    lines = [
        '-- Базовые станции из E_Net20220422.mdb (NRS_NET_StationInfo_220402)',
        'INSERT INTO stations',
        '  (external_id, station_code, name, host, port, mountpoint, ntrip_user, ntrip_password,',
        '   lat, lon, ecef_x, ecef_y, ecef_z, comment, is_enabled)',
        'VALUES',
    ]
    values = []
    skipped = 0
    for row in rows:
        x, y, z = float(row.X), float(row.Y), float(row.Z)
        if x == 0.0 and y == 0.0 and z == 0.0:
            skipped += 1
            continue
        if not (row.ClientIp or '').strip():
            skipped += 1
            continue
        lat, lon = ecef_to_lat_lon(x, y, z)
        values.append('  ({external_id}, {station_code}, {name}, {host}, {port}, {mount}, '
                       '{ntrip_user}, {ntrip_password}, {lat}, {lon}, {x}, {y}, {z}, {comment}, {enabled})'.format(
            external_id=sql_num(row.ID),
            station_code=sql_str(row.StationID),
            name=sql_str(row.StationName),
            host=sql_str(row.ClientIp),
            port=sql_num(int(row.ClientPort)),
            mount=sql_str(row.ClientMount),
            ntrip_user=sql_str(row.ClientName),
            ntrip_password=sql_str(row.ClientPassword),
            lat=round(lat, 7),
            lon=round(lon, 7),
            x=x, y=y, z=z,
            comment=sql_str(row.StationComment),
            enabled=1 if int(row.EStatus) == 1 else 0,
        ))
    lines.append(',\n'.join(values))
    lines.append(
        'ON DUPLICATE KEY UPDATE\n'
        '  station_code = VALUES(station_code), name = VALUES(name), host = VALUES(host),\n'
        '  port = VALUES(port), mountpoint = VALUES(mountpoint), ntrip_user = VALUES(ntrip_user),\n'
        '  ntrip_password = VALUES(ntrip_password), lat = VALUES(lat), lon = VALUES(lon),\n'
        '  ecef_x = VALUES(ecef_x), ecef_y = VALUES(ecef_y), ecef_z = VALUES(ecef_z),\n'
        '  comment = VALUES(comment), is_enabled = VALUES(is_enabled);'
    )
    print(f'stations: {len(values)} строк, пропущено {skipped}')
    return '\n'.join(lines)


def gen_users():
    conn = connect('E_Ser190905.mdb')
    cur = conn.cursor()
    cur.execute(
        'SELECT ID, UserName, Glname, USERPASSWORD, PUSERTIME, USERTIME, ScopeName, '
        'MountName, DeviceType, SN, EMAIL, Contact_person, Telephone FROM NRS_SER_UserDB'
    )
    rows = cur.fetchall()
    conn.close()

    lines = [
        '-- Пользователи из E_Ser190905.mdb (NRS_SER_UserDB)',
        'INSERT INTO users_sync',
        '  (id, user_name, gl_name, user_password, user_time, puser_time,',
        '   scope_name, mount_name, device_type, sn, email, contact_person, telephone, is_active)',
        'VALUES',
    ]
    values = []
    for row in rows:
        user_time = int(row.USERTIME or 0)
        values.append('  ({id}, {user_name}, {gl_name}, {password}, {user_time}, {puser_time}, '
                       '{scope}, {mount}, {device}, {sn}, {email}, {contact}, {phone}, {active})'.format(
            id=sql_num(row.ID),
            user_name=sql_str(row.UserName),
            gl_name=sql_str(row.Glname),
            password=sql_str(row.USERPASSWORD),
            user_time=user_time,
            puser_time=int(row.PUSERTIME or 0),
            scope=sql_str(row.ScopeName),
            mount=sql_str(row.MountName),
            device=sql_str(row.DeviceType),
            sn=sql_str(row.SN),
            email=sql_str(row.EMAIL),
            contact=sql_str(row.Contact_person),
            phone=sql_str(row.Telephone),
            active=1 if user_time > 0 else 0,
        ))
    lines.append(',\n'.join(values))
    lines.append(
        'ON DUPLICATE KEY UPDATE\n'
        '  user_name = VALUES(user_name), gl_name = VALUES(gl_name), user_password = VALUES(user_password),\n'
        '  user_time = VALUES(user_time), puser_time = VALUES(puser_time), scope_name = VALUES(scope_name),\n'
        '  mount_name = VALUES(mount_name), device_type = VALUES(device_type), sn = VALUES(sn),\n'
        '  email = VALUES(email), contact_person = VALUES(contact_person), telephone = VALUES(telephone),\n'
        '  is_active = VALUES(is_active);'
    )
    print(f'users_sync: {len(values)} строк')
    return '\n'.join(lines)


if __name__ == '__main__':
    out_path = os.path.join(BASE, 'sql', 'data_seed.sql')
    parts = [
        '-- Сгенерировано bin/gen_sql_dump.py из E_Net20220422.mdb и E_Ser190905.mdb',
        '-- Импортировать через phpMyAdmin ПОСЛЕ sql/schema.sql, в свою БД.',
        '',
        gen_stations(),
        '',
        gen_users(),
        '',
    ]
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(parts))
    print('Записано:', out_path)
