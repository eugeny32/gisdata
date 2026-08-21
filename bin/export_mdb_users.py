#!/usr/bin/env python3
"""
Windows-side half of the users_sync mdb bridge (see migration plan Sec.4 and
pyserver/users/services.py::sync_from_mdb_dump on the Linux side). Reads
NRS_SER_UserDB from the legacy Access database (E_Ser190905.mdb) via ODBC
and writes a portable JSON dump. There is no ODBC/Access driver on Linux,
so this script can only run on Windows (the old server, or any Windows
box with the "Microsoft Access Driver (*.mdb, *.accdb)" installed and the
.mdb file reachable).

Usage (on Windows, with the venv/interpreter that has pyodbc installed):
    python bin\export_mdb_users.py [output.json]

Then copy the resulting JSON to the new server''s MDB_SYNC_DUMP_PATH
(default /srv/gisdata/mdb_sync/users_sync.json) and either click
"Синхронизировать из mdb" on /users.php or run
`manage.py import_mdb_users` there.
"""

import json
import os
import sys

import pyodbc

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MDB_PATH = os.path.join(BASE, "E_Ser190905.mdb")
MDB_DRIVER = "Microsoft Access Driver (*.mdb, *.accdb)"


def connect(mdb_filename: str) -> pyodbc.Connection:
    conn_str = f"DRIVER={{{MDB_DRIVER}}};DBQ={os.path.join(BASE, mdb_filename)};"
    return pyodbc.connect(conn_str)


def export_users() -> list[dict]:
    conn = connect("E_Ser190905.mdb")
    cur = conn.cursor()
    cur.execute(
        "SELECT ID, UserName, Glname, USERPASSWORD, PUSERTIME, USERTIME, ScopeName, "
        "MountName, DeviceType, SN, EMAIL, Contact_person, Telephone FROM NRS_SER_UserDB"
    )
    rows = cur.fetchall()
    conn.close()

    return [
        {
            "id": int(row.ID),
            "user_name": row.UserName,
            "gl_name": row.Glname,
            "user_password": row.USERPASSWORD,
            "user_time": int(row.USERTIME or 0),
            "puser_time": int(row.PUSERTIME or 0),
            "scope_name": row.ScopeName,
            "mount_name": row.MountName,
            "device_type": row.DeviceType,
            "sn": row.SN,
            "email": row.EMAIL,
            "contact_person": row.Contact_person,
            "telephone": row.Telephone,
        }
        for row in rows
    ]


if __name__ == "__main__":
    out_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, "users_sync_dump.json")
    users = export_users()
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)
    print(f"users_sync: {len(users)} строк -> {out_path}")