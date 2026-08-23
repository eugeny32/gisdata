from django.urls import path

from . import views

urlpatterns = [
    path("slam_projects/", views.slam_projects_view, name="slam_projects"),
    path("slam_scans/", views.slam_scans_view, name="slam_scans"),
]

