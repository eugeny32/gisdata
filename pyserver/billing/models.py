"""
Subscription history, fully independent of users_sync.user_time (that
comes from mdb and is overwritten on every sync run — see users app). A
user can have multiple rows (renewal history); the active one is the
freshest by ends_at where is_cancelled = 0 and ends_at > now — see
active_for() below, ported from subscriptions.php's own query.
"""

from django.db import models
from django.utils import timezone

from core.models import Admin
from users.models import UserSync


class Subscription(models.Model):
    user = models.ForeignKey(UserSync, on_delete=models.CASCADE, related_name="subscriptions")
    plan_name = models.CharField(max_length=64, null=True, blank=True)
    starts_at = models.DateTimeField(default=timezone.now)
    ends_at = models.DateTimeField()
    is_cancelled = models.SmallIntegerField(default=0)
    note = models.CharField(max_length=255, null=True, blank=True)
    created_by = models.ForeignKey(
        Admin, db_column="created_by", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="subscriptions_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "subscriptions"
        indexes = [models.Index(fields=["user", "ends_at"], name="idx_sub_user")]

    @classmethod
    def active_for(cls, user_id: int):
        return (
            cls.objects.filter(user_id=user_id, is_cancelled=0, ends_at__gt=timezone.now())
            .order_by("-ends_at")
            .first()
        )