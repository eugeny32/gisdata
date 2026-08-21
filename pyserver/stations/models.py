"""
NTRIP base-station registry + live status + history. Not sourced from
mdb — created by hand through the admin pages (Фаза 2 of the migration
plan ports poll_stations.php's polling logic as a Django management
command run from a systemd timer).
"""

from django.db import models
from django.utils import timezone


class Station(models.Model):
    external_id = models.IntegerField(unique=True, null=True, blank=True)
    station_code = models.CharField(max_length=32, null=True, blank=True)
    name = models.CharField(max_length=128)
    host = models.CharField(max_length=255)
    port = models.IntegerField(default=2101)
    mountpoint = models.CharField(max_length=128)
    ntrip_user = models.CharField(max_length=128, null=True, blank=True)
    # Plaintext by explicit design, same tier as pg_connections.password —
    # see sql/schema.sql comment.
    ntrip_password = models.CharField(max_length=128, null=True, blank=True)
    lat = models.DecimalField(max_digits=10, decimal_places=7)
    lon = models.DecimalField(max_digits=10, decimal_places=7)
    ecef_x = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    ecef_y = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    ecef_z = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    rinex_path = models.CharField(max_length=255, null=True, blank=True)
    comment = models.CharField(max_length=255, null=True, blank=True)
    is_enabled = models.SmallIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "stations"
        indexes = [models.Index(fields=["host", "port", "mountpoint"], name="idx_host_mount")]

    def __str__(self):
        return self.name


class StationStatus(models.Model):
    STATUS_CHOICES = [("online", "Online"), ("offline", "Offline"), ("unknown", "Unknown")]

    station = models.OneToOneField(
        Station, primary_key=True, db_column="station_id", on_delete=models.CASCADE,
        related_name="status",
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="unknown")
    last_check_at = models.DateTimeField(null=True, blank=True)
    last_data_at = models.DateTimeField(null=True, blank=True)
    bytes_received = models.IntegerField(default=0)
    last_error = models.CharField(max_length=255, null=True, blank=True)
    # Secondary freshness channel via gnss.host FTP listings, polled hourly
    # (bin/poll_stations_ftp.php) — some stations aren't reachable for a
    # direct NTRIP poll from this server but still land data on the FTP.
    ftp_checked_at = models.DateTimeField(null=True, blank=True)
    ftp_last_data_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "station_status"


class StationLog(models.Model):
    station = models.ForeignKey(Station, db_column="station_id", on_delete=models.CASCADE, related_name="log_entries")
    checked_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=StationStatus.STATUS_CHOICES)
    bytes_received = models.IntegerField(default=0)
    error_message = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = "station_log"
        indexes = [models.Index(fields=["station", "checked_at"], name="idx_station_time")]