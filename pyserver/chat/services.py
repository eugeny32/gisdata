"""
Chat business logic -- conversation lookup/creation, unread counts, message
persistence (text + optional file/image/video/document attachments), and
the WS broadcast that fires on every send regardless of which path it came
in through (REST or the WebSocket consumer -- see send_message() below).
Kept framework-agnostic (no request/response here) so chat/views.py and
chat/consumers.py can share it without either depending on the other.
"""

import re
import uuid
from pathlib import Path

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.utils import timezone

from .models import Conversation, ConversationParticipant, Message, MessageAttachment

# Large media belongs in "Хранилище" (with a share link), not inline chat
# attachments -- keeps the quota math and per-request upload size sane.
MAX_ATTACHMENT_BYTES = 200 * 1024 * 1024

_IMAGE_EXT = {"jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"}
_VIDEO_EXT = {"mp4", "webm", "mov", "mkv", "avi"}


def participant_kwargs(admin, user) -> dict:
    """admin/user: dicts from core.auth.current_admin()/current_user() (or
    None) -- same XOR convention as storage/services.py::owner_key()."""
    if admin:
        return {"admin_id": admin["id"], "user_id": None}
    return {"admin_id": None, "user_id": user["id"]}


def actor_label(admin, user) -> str:
    if admin:
        return admin["login"]
    return user["user_name"]


def participant_label(participant: ConversationParticipant) -> str:
    if participant.admin_id:
        return participant.admin.full_name or participant.admin.login
    return participant.user.gl_name or participant.user.user_name


@transaction.atomic
def get_or_create_direct_conversation(admin_a, user_a, kind_b: str, id_b: int) -> Conversation:
    """Finds the existing 1:1 (non-group) conversation between the current
    actor and (kind_b, id_b), or creates one. Direct conversations are
    deduplicated by participant pair -- calling this twice for the same two
    people returns the same Conversation."""
    a_kwargs = participant_kwargs(admin_a, user_a)
    b_kwargs = {"admin_id": id_b, "user_id": None} if kind_b == "admin" else {"admin_id": None, "user_id": id_b}

    existing = (
        Conversation.objects.filter(is_group=False, participants__admin_id=a_kwargs["admin_id"], participants__user_id=a_kwargs["user_id"])
        .filter(participants__admin_id=b_kwargs["admin_id"], participants__user_id=b_kwargs["user_id"])
        .first()
    )
    if existing:
        return existing

    conversation = Conversation.objects.create(is_group=False)
    ConversationParticipant.objects.create(conversation=conversation, **a_kwargs)
    ConversationParticipant.objects.create(conversation=conversation, **b_kwargs)
    return conversation


def conversation_display_name(conversation: Conversation, admin, user) -> str:
    if conversation.title:
        return conversation.title
    mine = participant_kwargs(admin, user)
    other = (
        conversation.participants.exclude(admin_id=mine["admin_id"], user_id=mine["user_id"]).first()
    )
    return participant_label(other) if other else "Диалог"


def my_conversations(admin, user):
    mine = participant_kwargs(admin, user)
    return Conversation.objects.filter(
        participants__admin_id=mine["admin_id"], participants__user_id=mine["user_id"],
    ).order_by("-created_at")


def my_participant(conversation: Conversation, admin, user) -> ConversationParticipant | None:
    mine = participant_kwargs(admin, user)
    return conversation.participants.filter(**mine).first()


def is_participant(conversation: Conversation, admin, user) -> bool:
    return my_participant(conversation, admin, user) is not None


def unread_count(admin, user) -> int:
    mine = participant_kwargs(admin, user)
    own_message_filter = (
        {"sender_admin_id": mine["admin_id"]} if mine["admin_id"] else {"sender_user_id": mine["user_id"]}
    )
    total = 0
    for participant in ConversationParticipant.objects.filter(**mine):
        qs = Message.objects.filter(conversation_id=participant.conversation_id).exclude(**own_message_filter)
        if participant.last_read_at:
            qs = qs.filter(created_at__gt=participant.last_read_at)
        total += qs.count()
    return total


def mark_read(conversation: Conversation, admin, user) -> None:
    participant = my_participant(conversation, admin, user)
    if participant:
        participant.last_read_at = timezone.now()
        participant.save(update_fields=["last_read_at"])


def _detect_kind(content_type: str, name: str) -> str:
    if content_type.startswith("image/"):
        return "image"
    if content_type.startswith("video/"):
        return "video"
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext in _IMAGE_EXT:
        return "image"
    if ext in _VIDEO_EXT:
        return "video"
    return "document"


def save_attachments(message: Message, admin, user, files) -> list[MessageAttachment]:
    """Writes each upload into the SENDER's own storage tree (under
    "chat/conv_<id>/"), gated by the SAME unified 6GB quota as tours/the
    file manager (storage.services.total_storage_usage_bytes) -- chat
    attachments aren't a separate allowance. Raises ValueError with a
    user-facing message on any rejection; caller (chat/views.py) turns
    that into the HTTP error response."""
    from storage.services import owner_root, total_storage_usage_bytes
    from users.models import UserSync

    for f in files:
        if f.size > MAX_ATTACHMENT_BYTES:
            raise ValueError(
                f'Файл "{f.name}" больше 200 МБ — для крупных файлов используйте '
                '"Хранилище" и поделитесь ссылкой вместо вложения в чат'
            )

    if user and not admin:
        quota = UserSync.objects.filter(id=user["id"]).values_list("storage_quota_bytes", flat=True).first()
        if quota is not None:
            used = total_storage_usage_bytes(admin, user)
            incoming = sum(f.size for f in files)
            if used + incoming > quota:
                free = max(quota - used, 0)
                raise ValueError(
                    f"Недостаточно места в хранилище: доступно {free / (1024**3):.2f} ГБ из "
                    f"{quota / (1024**3):.2f} ГБ (использовано {used / (1024**3):.2f} ГБ)"
                )

    target_dir = owner_root(admin, user) / "chat" / f"conv_{message.conversation_id}"
    target_dir.mkdir(parents=True, exist_ok=True)

    saved = []
    for f in files:
        safe_name = re.sub(r"[^a-zA-Z0-9_.-]", "_", f.name)
        stored_name = f"{uuid.uuid4().hex}_{safe_name}"
        dest = target_dir / stored_name
        with open(dest, "wb") as out:
            for chunk in f.chunks():
                out.write(chunk)
        saved.append(MessageAttachment.objects.create(
            message=message,
            file_path=str((Path("chat") / f"conv_{message.conversation_id}" / stored_name).as_posix()),
            file_name=f.name,
            content_type=f.content_type or "application/octet-stream",
            kind=_detect_kind(f.content_type or "", f.name),
            size_bytes=f.size,
        ))
    return saved


def serialize_message(message: Message, viewer_admin=None, viewer_user=None, include_is_mine: bool = True) -> dict:
    sender_admin = {"id": message.sender_admin_id, "login": message.sender_admin.login} if message.sender_admin_id else None
    sender_user = {"id": message.sender_user_id, "user_name": message.sender_user.user_name} if message.sender_user_id else None
    data = {
        "id": message.id,
        "conversation_id": message.conversation_id,
        "body": message.body,
        "sender_label": actor_label(sender_admin, sender_user),
        "sender_admin_id": message.sender_admin_id,
        "sender_user_id": message.sender_user_id,
        "created_at": message.created_at.isoformat(),
        "attachments": [
            {
                "id": a.id, "kind": a.kind, "file_name": a.file_name,
                "size": a.size_bytes, "content_type": a.content_type,
                "url": f"/api/chat/attachments/{a.id}/download/",
            }
            for a in message.attachments.all()
        ],
    }
    if include_is_mine:
        mine = participant_kwargs(viewer_admin, viewer_user)
        data["is_mine"] = (
            (message.sender_admin_id == mine["admin_id"] and mine["admin_id"] is not None)
            or (message.sender_user_id == mine["user_id"] and mine["user_id"] is not None)
        )
    return data


def broadcast_message(message: Message) -> None:
    """Pushed to every WS-connected participant regardless of whether the
    message came in via the consumer or the REST fallback (chat/views.py)
    -- without this, a REST-sent message would only reach an actively
    WS-connected recipient on their next full reload."""
    layer = get_channel_layer()
    if not layer:
        return
    async_to_sync(layer.group_send)(f"chat_{message.conversation_id}", {
        "type": "chat.message",
        # No is_mine here -- one broadcast reaches multiple different
        # viewers; each client decides "mine" itself from sender ids
        # against its own known identity (see templates/base.html).
        "message": serialize_message(message, include_is_mine=False),
    })


def send_message(conversation: Conversation, admin, user, body: str, files=None) -> Message:
    body = (body or "").strip()
    if not body and not files:
        raise ValueError("Пустое сообщение")

    if admin:
        sender_kwargs = {"sender_admin_id": admin["id"], "sender_user_id": None}
    else:
        sender_kwargs = {"sender_admin_id": None, "sender_user_id": user["id"]}
    message = Message.objects.create(conversation=conversation, body=body, **sender_kwargs)
    if files:
        try:
            save_attachments(message, admin, user, files)
        except ValueError:
            message.delete()
            raise
    mark_read(conversation, admin, user)  # sending counts as having read up to now
    broadcast_message(message)
    return message
