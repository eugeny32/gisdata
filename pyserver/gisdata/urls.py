"""
Root URLconf. Populated incrementally per migration phase.
"""

from django.urls import include, path

urlpatterns = [
    path("", include("core.urls")),
    path("", include("stations.urls")),
    path("", include("users.urls")),
    path("", include("billing.urls")),
    path("", include("rinex.urls")),
    path("", include("tours.urls")),
    path("", include("cad_sessions.urls")),
    path("", include("slam_pipeline.urls")),
]