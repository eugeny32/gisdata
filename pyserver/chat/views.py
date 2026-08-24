"""
Chat HTTP surface -- served identically on ntrip.host and chat.ntrip.host
(same Django process, same urlconf; see the architecture note in the plan:
no separate codebase/session needed since SESSION_COOKIE_DOMAIN=".ntrip.host"
already shares the login). Real-time delivery is chat/consumers.py; these
views cover the page shell, history, and a REST fallback for sending (so
chat still works if a client's WebSocket connection is down).
"""

import json

from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from core import auth
from storage.services import search_platform_accounts

from . import services
from .models import Conversation, Message


def _actor(request):
    return auth.current_admin(request), auth.current_user(request)


@auth.require_login
def chat_home_view(request):
    admin, user = _actor(request)
    conversations = []
    for c in services.my_conversations(admin, user):
        conversations.append({
            "id": c.id,
            "name": services.conversation_display_name(c, admin, user),
            "last_message": c.messages.order_by("-created_at").values_list("body", flat=True).first(),
        })
    return render(request, "chat/home.html", {"conversations": conversations})


@auth.require_login
def conversation_view(request, conversation_id):
    admin, user = _actor(request)
    conversation = get_object_or_404(Conversation, id=conversation_id)
    if not services.is_participant(conversation, admin, user):
        return redirect("chat_home")

    services.mark_read(conversation, admin, user)
    mine = services.participant_kwargs(admin, user)
    messages = [
        {
            "id": m.id,
            "body": m.body,
            "sender_label": services.actor_label(
                {"id": m.sender_admin_id, "login": m.sender_admin.login} if m.sender_admin_id else None,
                {"id": m.sender_user_id, "user_name": m.sender_user.user_name} if m.sender_user_id else None,
            ),
            "is_mine": (
                (m.sender_admin_id == mine["admin_id"] and mine["admin_id"] is not None)
                or (m.sender_user_id == mine["user_id"] and mine["user_id"] is not None)
            ),
            "created_at": m.created_at.isoformat(),
        }
        for m in conversation.messages.select_related("sender_admin", "sender_user").order_by("created_at")
    ]
    return render(request, "chat/conversation.html", {
        "conversation": conversation,
        "conversation_name": services.conversation_display_name(conversation, admin, user),
        "messages": messages,
    })


@auth.require_login
@require_POST
def send_message_view(request, conversation_id):
    """REST fallback for send -- see module docstring. The WS consumer
    covers the live path; this covers "WebSocket didn't connect"."""
    admin, user = _actor(request)
    conversation = get_object_or_404(Conversation, id=conversation_id)
    if not services.is_participant(conversation, admin, user):
        return JsonResponse({"error": "Нет доступа"}, status=403)
    try:
        payload = json.loads(request.body or b"{}")
    except (ValueError, TypeError):
        payload = {}
    body = (payload.get("body") or "").strip()
    if not body:
        return JsonResponse({"error": "Пустое сообщение"}, status=400)
    message = services.send_message(conversation, admin, user, body)
    return JsonResponse({"id": message.id, "created_at": message.created_at.isoformat()})


@auth.require_login
@require_POST
def start_conversation_view(request):
    admin, user = _actor(request)
    kind = request.POST.get("kind")
    target_id = request.POST.get("id")
    if kind not in ("admin", "user") or not target_id:
        return JsonResponse({"error": "Не указан собеседник"}, status=400)
    conversation = services.get_or_create_direct_conversation(admin, user, kind, int(target_id))
    return JsonResponse({"conversation_id": conversation.id})


@auth.require_login
def search_accounts_view(request):
    admin, user = _actor(request)
    query = request.GET.get("q", "")
    results = search_platform_accounts(query, exclude_admin=admin, exclude_user=user)
    return JsonResponse({"results": results})


@auth.require_login
def unread_count_view(request):
    admin, user = _actor(request)
    return JsonResponse({"count": services.unread_count(admin, user)})
