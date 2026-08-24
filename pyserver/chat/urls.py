from django.urls import path

from . import views

urlpatterns = [
    path("chat/", views.chat_home_view, name="chat_home"),
    path("chat/<int:conversation_id>/", views.conversation_view, name="chat_conversation"),
    path("api/chat/<int:conversation_id>/send/", views.send_message_view, name="api_chat_send"),
    path("api/chat/start/", views.start_conversation_view, name="api_chat_start"),
    path("api/chat/search_accounts/", views.search_accounts_view, name="api_chat_search_accounts"),
    path("api/chat/unread_count/", views.unread_count_view, name="api_chat_unread_count"),
]
