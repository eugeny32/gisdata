"""
Staff/back-office identity — the `admins` side of the dual-auth model (see
auth.py). Deliberately NOT django.contrib.auth.User: two disjoint identity
tables (this one and users.UserSync) share one session, and only one is
ever active at a time, mirroring app/lib/auth.php exactly.
"""

from django.db import models


class Admin(models.Model):
    ROLE_ADMIN = "admin"
    ROLE_VIEWER = "viewer"
    ROLE_CHOICES = [(ROLE_ADMIN, "Admin"), (ROLE_VIEWER, "Viewer")]

    login = models.CharField(max_length=64, unique=True)
    # Django hashers ("pbkdf2_sha256$...") going forward; legacy unsalted
    # SHA-256 hex (old PHP `hash('sha256', $password)`) still verified for
    # not-yet-migrated rows — see auth.verify_admin_password().
    password_hash = models.CharField(max_length=255)
    full_name = models.CharField(max_length=128, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_ADMIN)
    email = models.CharField(max_length=128, null=True, blank=True)
    phone = models.CharField(max_length=64, null=True, blank=True)
    is_active = models.SmallIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admins"

    def __str__(self):
        return self.login


class AdminInvite(models.Model):
    token = models.CharField(max_length=64, unique=True)
    role = models.CharField(max_length=20, choices=Admin.ROLE_CHOICES, default=Admin.ROLE_VIEWER)
    email = models.CharField(max_length=128, null=True, blank=True)
    full_name = models.CharField(max_length=128, null=True, blank=True)
    created_by = models.ForeignKey(
        Admin, db_column="created_by", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="invites_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "admin_invites"

    def __str__(self):
        return self.token