"""
`users_sync` — a mirror of the external legacy Access DB (E_Ser190905.mdb,
NRS_SER_UserDB), NOT owned by this app. Source of truth stays the .mdb;
this table is only fast-lookup storage for login + entitlement flags. On
the new Linux server the ODBC sync itself can't run (Windows/Access-only
driver) — see the migration plan's mdb-bridge decision: a small script on
a Windows box keeps exporting this table's contents, imported here on a
schedule (see core/management/commands, added when that bridge lands).

id is NOT a Django-assigned serial — it's the literal mdb row ID, carried
over verbatim so re-sync/imports stay idempotent.
"""

from django.db import models


class UserSync(models.Model):
    id = models.IntegerField(primary_key=True)
    user_name = models.CharField(max_length=64, unique=True)
    gl_name = models.CharField(max_length=64, null=True, blank=True)
    # Plaintext, as mirrored from mdb — see module docstring; not a
    # credential store we're free to hash without breaking the sync.
    user_password = models.CharField(max_length=128)
    user_time = models.BigIntegerField(default=0)
    puser_time = models.BigIntegerField(default=0)
    scope_name = models.CharField(max_length=64, null=True, blank=True)
    mount_name = models.CharField(max_length=64, null=True, blank=True)
    device_type = models.CharField(max_length=64, null=True, blank=True)
    sn = models.CharField(max_length=64, null=True, blank=True)
    email = models.CharField(max_length=128, null=True, blank=True)
    contact_person = models.CharField(max_length=128, null=True, blank=True)
    telephone = models.CharField(max_length=64, null=True, blank=True)
    is_active = models.SmallIntegerField(default=1)
    # Added via web form rather than mdb sync — sync must not overwrite these.
    is_manual = models.SmallIntegerField(default=0)
    facade_cad_enabled = models.SmallIntegerField(default=0)
    topo_cad_enabled = models.SmallIntegerField(default=0)
    facade_foto_enabled = models.SmallIntegerField(default=0)
    synced_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users_sync"

    def __str__(self):
        return self.user_name