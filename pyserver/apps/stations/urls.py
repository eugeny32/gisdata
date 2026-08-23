from django.urls import path

from . import views

urlpatterns = [
    path("stations/", views.stations_view, name="stations"),
    path("api/stations_status/", views.api_stations_status, name="api_stations_status"),
]