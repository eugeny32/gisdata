from django.urls import path

from apps.tours import views

urlpatterns = [
    path("", views.tours_view, name="tours"),
    path("tour_files/", views.tour_files_view, name="tour_files"),
    path("map/", views.map_view, name="map"),
    path("tour_view/", views.tour_view_view, name="tour_view"),
    path("tour_user_upload/", views.tour_user_upload_view, name="tour_user_upload"),
    path("my_tours/", views.my_tours_view, name="my_tours"),
    path("tour_export/", views.tour_export_view, name="tour_export"),
    path("pg_connections/", views.pg_connections_view, name="pg_connections"),
    path("api/tours/", views.api_tours_view, name="api_tours"),
    path("api/tour_annotations/", views.api_tour_annotations_view, name="api_tour_annotations"),
]
