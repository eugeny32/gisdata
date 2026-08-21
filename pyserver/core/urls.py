from django.urls import path

from . import views

urlpatterns = [
    path("", views.index_view, name="index"),
    path("healthz", views.healthcheck, name="healthcheck"),
    path("login/", views.login_view, name="login"),
    path("admin_login/", views.admin_login_view, name="admin_login"),
    path("logout/", views.logout_view, name="logout"),
    path("home/", views.home_view, name="home"),
    path("employees/", views.employees_view, name="employees"),
    path("employee_invites/", views.employee_invites_view, name="employee_invites"),
    path("invite_accept/", views.invite_accept_view, name="invite_accept"),
    path("tile_layout/", views.tile_layout_view, name="tile_layout"),
]