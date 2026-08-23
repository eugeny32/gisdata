from django.urls import path

from apps.billing import views

urlpatterns = [
    path("subscriptions/", views.subscriptions_view, name="subscriptions"),
]
