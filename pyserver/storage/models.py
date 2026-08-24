"""
Self-service file storage ("проводник") for platform accounts (Admin XOR
UserSync -- same polymorphic-owner pattern as cad_sessions/models.py: two
nullable FKs + a CheckConstraint XOR, since admins/users_sync are separate
tables with no shared "person" concept).

The filesystem is the source of truth for actual files/folders (same
philosophy as tours: no per-file DB rows for content, see
tours/services.py::user_storage_usage_bytes) -- this model exists ONLY to
record sharing grants: who can see whose files.
"""

from django.db import models

from core.models import Admin
from users.models import UserSync


class SharedAccess(models.Model):
    shared_by_admin = models.ForeignKey(
        Admin, on_delete=models.CASCADE, null=True, blank=True, related_name="+",
    )
    shared_by_user = models.ForeignKey(
        UserSync, on_delete=models.CASCADE, null=True, blank=True, related_name="+",
    )
    shared_with_admin = models.ForeignKey(
        Admin, on_delete=models.CASCADE, null=True, blank=True, related_name="+",
    )
    shared_with_user = models.ForeignKey(
        UserSync, on_delete=models.CASCADE, null=True, blank=True, related_name="+",
    )
    # Relative POSIX-style path (no leading slash) within shared_by's
    # storage root -- a file or a folder (folder grants cover everything
    # under it, see storage/services.py::shared_access_covers()).
    path = models.CharField(max_length=1024)
    can_write = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "storage_shared_access"
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(shared_by_admin__isnull=False, shared_by_user__isnull=True)
                    | models.Q(shared_by_admin__isnull=True, shared_by_user__isnull=False)
                ),
                name="chk_shared_access_by_owner",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(shared_with_admin__isnull=False, shared_with_user__isnull=True)
                    | models.Q(shared_with_admin__isnull=True, shared_with_user__isnull=False)
                ),
                name="chk_shared_access_with_owner",
            ),
        ]
        indexes = [
            models.Index(fields=["shared_with_admin"], name="idx_shared_access_with_admin"),
            models.Index(fields=["shared_with_user"], name="idx_shared_access_with_user"),
        ]
