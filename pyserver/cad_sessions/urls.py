from django.urls import path

from . import views

urlpatterns = [
    path("facade_cad/", views.facade_cad_view, name="facade_cad"),
    path("topo_cad/", views.topo_cad_view, name="topo_cad"),
    path("facade_foto/", views.facade_foto_view, name="facade_foto"),
    path("ctfadmin_panel/", views.ctfadmin_view, name="ctfadmin"),
    path("api/facade_cad_session/", views.api_facade_cad_session_view, name="api_facade_cad_session"),
    path("api/topo_cad_session/", views.api_topo_cad_session_view, name="api_topo_cad_session"),
    path("api/facade_foto_session/", views.api_facade_foto_session_view, name="api_facade_foto_session"),
]
