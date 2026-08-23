"""
Root URLconf. Populated incrementally per migration phase.
"""

from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from apps.cad.views import (
    api_facade_cad_session_view,
    api_topo_cad_session_view,
    api_facade_foto_session_view,
)

urlpatterns = [
    # Legacy PHP-compatible API routes (frontend SPAs call these)
    path("api/facade_cad_session.php", api_facade_cad_session_view),
    path("api/topo_cad_session.php", api_topo_cad_session_view),
    path("api/facade_foto_session.php", api_facade_foto_session_view),

    path("", include("apps.core.urls")),
    path("stations/", include("apps.stations.urls")),
    path("users/", include("apps.users.urls")),
    path("billing/", include("apps.billing.urls")),
    path("rinex/", include("apps.rinex.urls")),
    path("tours/", include("apps.tours.urls")),
    path("cad/", include("apps.cad.urls")),
    path("slam/", include("apps.slam.urls")),
    path("documents/", include("apps.documents.urls")),
    # path("api/v1/", include("apps.api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)





