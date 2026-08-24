"""
NTRIP station polling — port of app/lib/ntrip_poll.php. Connects to
host:port, sends an NTRIP v1 GET request for the mountpoint, and treats
"real stream bytes arrived within the timeout" as the liveness signal
(more reliable than a bare open TCP port — a caster can accept the
connection but not actually serve the requested mountpoint).

Shared by stations.views (the "Опросить сейчас" button) and the
poll_stations management command (Фаза 2's systemd-timer equivalent of
bin/poll_stations.php), exactly like the PHP original shares one function
between the cron script and the button.
"""

import base64
import socket
import time
from dataclasses import dataclass

from django.utils import timezone

from .models import Station, StationLog, StationStatus

CONNECT_TIMEOUT_SEC = 5
READ_TIMEOUT_SEC = 8
MIN_BYTES_ONLINE = 256
USER_AGENT = "NTRIP GISDataMonitor/1.0"


@dataclass
class PollResult:
    status: str
    bytes: int
    error: str | None


def check_ntrip_station(station: Station) -> PollResult:
    try:
        sock = socket.create_connection((station.host, station.port), timeout=CONNECT_TIMEOUT_SEC)
    except OSError as exc:
        return PollResult("offline", 0, f"Connect failed: {exc}")

    sock.settimeout(READ_TIMEOUT_SEC)
    auth_header = ""
    if station.ntrip_user:
        creds = f"{station.ntrip_user}:{station.ntrip_password or ''}".encode()
        auth_header = f"Authorization: Basic {base64.b64encode(creds).decode()}\r\n"

    request = (
        f"GET /{station.mountpoint} HTTP/1.1\r\n"
        f"Host: {station.host}\r\n"
        f"User-Agent: {USER_AGENT}\r\n"
        f"Ntrip-Version: Ntrip/2.0\r\n"
        f"{auth_header}"
        f"Connection: close\r\n\r\n"
    )
    try:
        sock.sendall(request.encode())
    except OSError as exc:
        sock.close()
        return PollResult("offline", 0, f"Send failed: {exc}")

    received = b""
    header_seen = False
    deadline = time.monotonic() + READ_TIMEOUT_SEC
    while time.monotonic() < deadline:
        try:
            chunk = sock.recv(4096)
        except socket.timeout:
            break
        except OSError:
            break
        if not chunk:
            break
        received += chunk
        if not header_seen and (b"SOURCETABLE" in chunk or b"401" in chunk or b"ERROR" in chunk):
            sock.close()
            text = chunk.decode("utf-8", errors="replace")
            detail = ""
            for line in text.split("\r\n"):
                if line.lower().startswith("www-authenticate"):
                    detail = line.strip()
                    break
            if not detail:
                detail = text.split("\r\n", 1)[0].strip() or text
            return PollResult(
                "offline", len(received),
                f"Mountpoint недоступен или нужна авторизация: {detail[:200]}",
            )
        header_seen = True
        if len(received) >= MIN_BYTES_ONLINE:
            break

    sock.close()
    if len(received) >= MIN_BYTES_ONLINE:
        return PollResult("online", len(received), None)
    return PollResult("offline", len(received), "Поток пуст или слишком короткий")


def poll_stations(stations) -> dict:
    counts = {"online": 0, "offline": 0}
    for station in stations:
        result = check_ntrip_station(station)
        # One retry on first failure — some casters occasionally answer
        # 401/reset on a single attempt (e.g. concurrent-connection limit
        # with the same login) even though the station is genuinely up;
        # confirmed manually on station ZRCH. Full "offline" only after two
        # consecutive failures.
        if result.status != "online":
            result = check_ntrip_station(station)

        now = timezone.now()
        StationStatus.objects.update_or_create(
            station=station,
            defaults={
                "status": result.status,
                "last_check_at": now,
                "last_data_at": now if result.status == "online" else None,
                "bytes_received": result.bytes,
                "last_error": result.error,
            },
        )
        StationLog.objects.create(
            station=station, status=result.status,
            bytes_received=result.bytes, error_message=result.error,
        )
        counts[result.status] = counts.get(result.status, 0) + 1
    return counts