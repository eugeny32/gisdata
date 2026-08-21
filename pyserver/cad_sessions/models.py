"""
Server-side saved work state for the three vendored CAD/photo SPAs
(FACADE·CAD, TOPO·CAD, FACADE·FOTO — see ../../facade-cad/,
../../facade-foto/), replacing what used to be browser localStorage.
Owner is polymorphic (admin XOR regular user) since admins/users_sync are
separate tables with no shared "person" concept — see the CHECK
constraints in sql/schema.sql, reproduced here as Meta.constraints so a
fresh `migrate` on this schema stays faithful even without --fake-initial.

FACADE·CAD/TOPO·CAD store drawn geometry as REAL PostGIS geometry (one row
per CAD object, not a JSON blob) — this is the one place in the whole
schema where GeoDjango actually buys something over hand-rolled WKT
round-tripping: `entity.geom` is just a GEOSGeometry, no manual
ST_GeomFromText/ST_AsGeoJSON needed in the session API views (Фаза 6).
FACADE·FOTO has no such column: its control points live in photo pixel
space, not model space, so it's a single opaque JSONB blob instead.
"""

from django.contrib.gis.db import models as gis_models
from django.db import models

from core.models import Admin
from users.models import UserSync

ENTITY_KIND_CHOICES = [
    ("pl", "Polyline"), ("ci", "Circle"), ("ar", "Arc"),
    ("el", "Ellipse"), ("tx", "Text"), ("pt", "Point"),
]


class _SessionOwnerMixin(models.Model):
    """Shared owner fields — see module docstring for why not one polymorphic FK."""

    cloud_name = models.CharField(max_length=255, null=True, blank=True)
    layers_json = models.TextField(default="{}")
    ucs_json = models.TextField(default="{}")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class FacadeCadSession(_SessionOwnerMixin):
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, null=True, blank=True, related_name="+")
    user = models.ForeignKey(UserSync, on_delete=models.CASCADE, null=True, blank=True, related_name="+")

    class Meta:
        db_table = "facade_cad_sessions"
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(admin__isnull=False, user__isnull=True)
                    | models.Q(admin__isnull=True, user__isnull=False)
                ),
                name="chk_facade_cad_session_owner",
            ),
            models.UniqueConstraint(fields=["admin"], name="uq_facade_cad_session_admin"),
            models.UniqueConstraint(fields=["user"], name="uq_facade_cad_session_user"),
        ]


class FacadeCadEntity(models.Model):
    session = models.ForeignKey(FacadeCadSession, on_delete=models.CASCADE, related_name="entities")
    kind = models.CharField(max_length=4, choices=ENTITY_KIND_CHOICES)
    layer = models.CharField(max_length=64, default="0")
    # Unconstrained geometry type/SRID: coordinates are local UCS meters,
    # not geodetic — polyline -> LINESTRING as-is, circle/arc/ellipse/
    # text/point -> their anchor point; all other params (radius, angles,
    # text, rotation, label) live in `extra`, since PostGIS has no
    # circle/ellipse primitive.
    geom = gis_models.GeometryField(srid=0)
    extra = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "facade_cad_entities"
        indexes = [models.Index(fields=["session"], name="idx_fcad_entities_sess")]


class TopoCadSession(_SessionOwnerMixin):
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, null=True, blank=True, related_name="+")
    user = models.ForeignKey(UserSync, on_delete=models.CASCADE, null=True, blank=True, related_name="+")

    class Meta:
        db_table = "topo_cad_sessions"
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(admin__isnull=False, user__isnull=True)
                    | models.Q(admin__isnull=True, user__isnull=False)
                ),
                name="chk_topo_cad_session_owner",
            ),
            models.UniqueConstraint(fields=["admin"], name="uq_topo_cad_session_admin"),
            models.UniqueConstraint(fields=["user"], name="uq_topo_cad_session_user"),
        ]


class TopoCadEntity(models.Model):
    session = models.ForeignKey(TopoCadSession, on_delete=models.CASCADE, related_name="entities")
    kind = models.CharField(max_length=4, choices=ENTITY_KIND_CHOICES)
    layer = models.CharField(max_length=64, default="0")
    geom = gis_models.GeometryField(srid=0)
    extra = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "topo_cad_entities"
        indexes = [models.Index(fields=["session"], name="idx_topo_cad_entities_session")]


class FacadeFotoSession(models.Model):
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, null=True, blank=True, related_name="+")
    user = models.ForeignKey(UserSync, on_delete=models.CASCADE, null=True, blank=True, related_name="+")
    # points/k1/k2/mmPerPx/target/source — same shape the tool already
    # saves to a downloadable facade_session.json; no per-field columns
    # since coordinates are photo pixel space, not a real geometry.
    session_json = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "facade_foto_sessions"
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(admin__isnull=False, user__isnull=True)
                    | models.Q(admin__isnull=True, user__isnull=False)
                ),
                name="chk_facade_foto_session_owner",
            ),
            models.UniqueConstraint(fields=["admin"], name="uq_facade_foto_session_admin"),
            models.UniqueConstraint(fields=["user"], name="uq_facade_foto_session_user"),
        ]