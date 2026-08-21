from django.urls import path

from . import views

urlpatterns = [
    path("users/", views.users_view, name="users"),
]