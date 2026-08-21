"""
Background RINEX-download jobs (rinex.php -> process_rinex_requests.php).
The synthetic RINEX generator (rinex_generate.php / app/lib/rinex_gen/*)
is pure physics/math with no DB state of its own — ported as a service
module in this app, not a model.
"""

from django.db import models

from core.models import Admin


class RinexRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"), ("processing", "Processing"),
        ("done", "Done"), ("error", "Error"),
    ]

    created_by = models.ForeignKey(
        Admin, db_column="created_by", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="rinex_requests",
    )
    stations = models.CharField(max_length=500)  # comma-separated station codes
    date_from_utc = models.DateTimeField()
    date_to_utc = models.DateTimeField()
    want_obs = models.SmallIntegerField(default=1)
    want_nav = models.SmallIntegerField(default=1)
    merge_by_day = models.SmallIntegerField(default=1)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="pending")
    result_path = models.CharField(max_length=255, null=True, blank=True)
    file_count = models.IntegerField(null=True, blank=True)
    error_message = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "rinex_requests"
        indexes = [
            models.Index(fields=["status", "created_at"], name="idx_rinex_requests_status"),
            models.Index(fields=["created_by", "created_at"], name="idx_rinex_requests_creator"),
        ]