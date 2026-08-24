from django.urls import path

from . import views

urlpatterns = [
    path("subscriptions/", views.subscriptions_view, name="subscriptions"),
]