"""
Chat HTTP surface -- served identically on ntrip.host and chat.ntrip.host
(same Django process, same urlconf; see the architecture note in the plan:
no separate codebase/session needed since SESSION_COOKIE_DOMAIN=".ntrip.host"
already shares the login). Real-time delivery is chat/consumers.py; these
views cover the modal's JSON API (chat/views.py::conversations_json_view/
messages_json_view), the standalone page shell for chat.ntrip.host direct
visits, attachment upload/download, and a REST fallback for sending (so
chat still works if a client's WebSocket connection is down).
"""

import json
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from core import auth
from storage.services import owner_root as storage_owner_root
from storage.services import safe_join, search_platform_accounts

from . import livekit, services
from .models import Conversation, MessageAttachment


def _actor(request):
    return auth.current_admin(request), auth.current_user(request)


def _get_owned_conversation_or_403(request, conversation_id):
    admin, user = _actor(request)
    conversation = get_object_or_404(Conversation, id=conversation_id)
    if not services.is_participant(conversation, admin, user):
        return None, None, None
    return conversation, admin, user


# --- Standalone page shell (chat.ntrip.host direct visits) --------------

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
    conversation, admin, user = _get_owned_conversation_or_403(request, conversation_id)
    if not conversation:
        return redirect("chat_home")

    services.mark_read(conversation, admin, user)
    messages = [
        services.serialize_message(m, admin, user)
        for m in conversation.messages.select_related("sender_admin", "sender_user").prefetch_related("attachments").order_by("created_at")
    ]
    return render(request, "chat/conversation.html", {
        "conversation": conversation,
        "conversation_name": services.conversation_display_name(conversation, admin, user),
        "messages": messages,
    })


# --- Modal JSON API -------------------------------------------------------

@auth.require_login
def conversations_json_view(request):
    admin, user = _actor(request)
    conversations = []
    for c in services.my_conversations(admin, user):
        conversations.append({
            "id": c.id,
            "name": services.conversation_display_name(c, admin, user),
            "last_message": c.messages.order_by("-created_at").values_list("body", flat=True).first(),
        })
    return JsonResponse({"conversations": conversations})


@auth.require_login
def messages_json_view(request, conversation_id):
    conversation, admin, user = _get_owned_conversation_or_403(request, conversation_id)
    if not conversation:
        return JsonResponse({"error": "Нет доступа"}, status=403)
    services.mark_read(conversation, admin, user)
    messages = [
        services.serialize_message(m, admin, user)
        for m in conversation.messages.select_related("sender_admin", "sender_user").prefetch_related("attachments").order_by("created_at")
    ]
    return JsonResponse({
        "conversation_id": conversation.id,
        "conversation_name": services.conversation_display_name(conversation, admin, user),
        "messages": messages,
    })


# --- Send / attachments ----------------------------------------------------

@auth.require_login
@require_POST
def send_message_view(request, conversation_id):
    """REST fallback for send -- see module docstring. The WS consumer
    covers the live path; this covers "WebSocket didn't connect", and is
    the ONLY path for attachments (the WS protocol is JSON-text-only, see
    chat/consumers.py)."""
    conversation, admin, user = _get_owned_conversation_or_403(request, conversation_id)
    if not conversation:
        return JsonResponse({"error": "Нет доступа"}, status=403)

    files = request.FILES.getlist("files")
    if files:
        body = request.POST.get("body", "")
    else:
        try:
            payload = json.loads(request.body or b"{}")
        except (ValueError, TypeError):
            payload = {}
        body = payload.get("body") or ""

    try:
        message = services.send_message(conversation, admin, user, body, files=files or None)
    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)
    return JsonResponse(services.serialize_message(message, admin, user))


@auth.require_login
def download_attachment_view(request, attachment_id):
    admin, user = _actor(request)
    attachment = get_object_or_404(
        MessageAttachment.objects.select_related("message", "message__sender_admin", "message__sender_user"),
        id=attachment_id,
    )
    if not services.is_participant(attachment.message.conversation, admin, user):
        return HttpResponse("403 Forbidden", status=403)

    sender_admin = {"id": attachment.message.sender_admin_id} if attachment.message.sender_admin_id else None
    sender_user = {"id": attachment.message.sender_user_id} if attachment.message.sender_user_id else None
    root = storage_owner_root(sender_admin, sender_user)
    try:
        target = safe_join(root, attachment.file_path)
    except ValueError:
        return HttpResponse("400 Bad Request", status=400)
    if not target.is_file():
        raise Http404("Файл не найден")

    internal_prefix = getattr(settings, "STORAGE_INTERNAL_ALIAS", None)
    # PDFs render natively in-browser same as images/video -- everything
    # else (Word/Excel/zip/...) still forces a download, browsers don't
    # know what to do with those inline.
    previewable = attachment.kind in ("image", "video") or attachment.content_type == "application/pdf"
    disposition = "inline" if previewable else "attachment"
    if internal_prefix:
        rel_to_storage_root = target.relative_to(Path(settings.UPLOADS_ROOT) / "user_storage")
        response = HttpResponse(content_type=attachment.content_type)
        response["X-Accel-Redirect"] = f"{internal_prefix}/{rel_to_storage_root.as_posix()}"
        response["Content-Disposition"] = f'{disposition}; filename="{attachment.file_name}"'
        return response

    return FileResponse(
        open(target, "rb"), as_attachment=(disposition == "attachment"),
        filename=attachment.file_name, content_type=attachment.content_type,
    )


# --- Conversations / account search ----------------------------------------

@auth.require_login
@require_POST
def start_conversation_view(request):
    admin, user = _actor(request)
    kind = request.POST.get("kind")
    target_id = request.POST.get("id")
    if kind not in ("admin", "user") or not target_id:
        return JsonResponse({"error": "Не указан собеседник"}, status=400)
    conversation = services.get_or_create_direct_conversation(admin, user, kind, int(target_id))
    return JsonResponse({
        "conversation_id": conversation.id,
        "name": services.conversation_display_name(conversation, admin, user),
    })


@auth.require_login
@require_POST
def attach_from_storage_view(request, conversation_id):
    """Attaches a file the sender already has in "Хранилище" -- see
    chat/services.py::attach_storage_file(). The browse/pick UI reuses
    storage app's own {% url "api_storage_list" %} directly (it already
    defaults to the caller's own root), no separate listing endpoint
    needed here."""
    conversation, admin, user = _get_owned_conversation_or_403(request, conversation_id)
    if not conversation:
        return JsonResponse({"error": "Нет доступа"}, status=403)
    try:
        payload = json.loads(request.body or b"{}")
    except (ValueError, TypeError):
        payload = {}
    relpath = (payload.get("path") or "").strip()
    if not relpath:
        return JsonResponse({"error": "Не выбран файл"}, status=400)
    try:
        message = services.send_message_from_storage(conversation, admin, user, relpath, body=payload.get("body") or "")
    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)
    return JsonResponse(services.serialize_message(message, admin, user))


@auth.require_login
@require_POST
def save_attachment_to_storage_view(request, attachment_id):
    admin, user = _actor(request)
    attachment = get_object_or_404(MessageAttachment.objects.select_related("message"), id=attachment_id)
    if not services.is_participant(attachment.message.conversation, admin, user):
        return JsonResponse({"error": "Нет доступа"}, status=403)
    try:
        saved_path = services.save_attachment_to_storage(attachment, admin, user)
    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)
    return JsonResponse({"ok": True, "path": saved_path})


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


# --- Calls -------------------------------------------------------------

@auth.require_login
@require_POST
def call_token_view(request, conversation_id):
    conversation, admin, user = _get_owned_conversation_or_403(request, conversation_id)
    if not conversation:
        return JsonResponse({"error": "Нет доступа"}, status=403)
    if not settings.LIVEKIT_API_KEY or not settings.LIVEKIT_API_SECRET:
        return JsonResponse({"error": "Звонки не настроены на сервере"}, status=503)

    login = admin["login"] if admin else user["user_name"]
    display_name = services.actor_label(admin, user)
    access = livekit.mint_call_access(room=f"chat-{conversation.id}", login=login, display_name=display_name)
    return JsonResponse(access)
