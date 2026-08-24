from django.urls import path

from . import views

urlpatterns = [
    path("storage/", views.explorer_view, name="storage_explorer"),
    path("api/storage/list/", views.api_list_view, name="api_storage_list"),
    path("api/storage/mkdir/", views.api_mkdir_view, name="api_storage_mkdir"),
    path("api/storage/upload/", views.api_upload_view, name="api_storage_upload"),
    path("api/storage/rename/", views.api_rename_view, name="api_storage_rename"),
    path("api/storage/delete/", views.api_delete_view, name="api_storage_delete"),
    path("api/storage/download/", views.api_download_view, name="api_storage_download"),
    path("api/storage/share/", views.api_share_view, name="api_storage_share"),
    path("api/storage/unshare/", views.api_unshare_view, name="api_storage_unshare"),
    path("api/storage/search_accounts/", views.api_search_accounts_view, name="api_storage_search_accounts"),
]
