from django.urls import path

from . import views

urlpatterns = [
    path("rinex/", views.rinex_view, name="rinex"),
    path("rinex_download_zip/", views.rinex_download_zip_view, name="rinex_download_zip"),
    path("rinex_requests/", views.rinex_requests_view, name="rinex_requests"),
    path("rinex_request_download/", views.rinex_request_download_view, name="rinex_request_download"),
    path("rinex_generate/", views.rinex_generate_view, name="rinex_generate"),
]