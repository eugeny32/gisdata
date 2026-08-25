"""
Chat business logic -- conversation lookup/creation, unread counts, message
persistence (text + optional file/image/video/document attachments, either
freshly uploaded or attached from the sender's existing "Хранилище"
storage), and the WS broadcast that fires on every send regardless of
which path it came in through (REST or the WebSocket consumer -- see
send_message() below). Kept framework-agnostic (no request/response here)
so chat/views.py and chat/consumers.py can share it without either
depending on the other.
"""

import mimetypes
import re
import shutil
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


def _check_quota(admin, user, incoming_bytes: int) -> None:
    """Shared by every path that adds bytes to a sender's storage tree
    (fresh upload, attach-from-storage copy, save-a-received-attachment)
    -- raises ValueError with a user-facing message on rejection. Admins
    have no quota today (see storage/models.py), so this only ever
    rejects plain UserSync senders."""
    if not user or admin:
        return
    from storage.services import total_storage_usage_bytes
    from users.models import UserSync

    quota = UserSync.objects.filter(id=user["id"]).values_list("storage_quota_bytes", flat=True).first()
    if quota is None:
        return
    used = total_storage_usage_bytes(admin, user)
    if used + incoming_bytes > quota:
        free = max(quota - used, 0)
        raise ValueError(
            f"Недостаточно места в хранилище: доступно {free / (1024**3):.2f} ГБ из "
            f"{quota / (1024**3):.2f} ГБ (использовано {used / (1024**3):.2f} ГБ)"
        )


def save_attachments(message: Message, admin, user, files) -> list[MessageAttachment]:
    """Writes each upload into the SENDER's own storage tree (under
    "chat/conv_<id>/"), gated by the SAME unified 6GB quota as tours/the
    file manager. Raises ValueError with a user-facing message on any
    rejection; caller (chat/views.py) turns that into the HTTP error
    response."""
    from storage.services import owner_root

    for f in files:
        if f.size > MAX_ATTACHMENT_BYTES:
            raise ValueError(
                f'Файл "{f.name}" больше 200 МБ — для крупных файлов используйте '
                '"Хранилище" и поделитесь ссылкой вместо вложения в чат'
            )
    _check_quota(admin, user, sum(f.size for f in files))

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


def attach_storage_file(message: Message, admin, user, relpath: str) -> MessageAttachment:
    """Attaches a file the sender ALREADY has in their "Хранилище"
    (storage app) -- no re-upload from the browser needed. Copies it into
    the same "chat/conv_<id>/" tree a fresh upload would use (a durable
    snapshot at send-time, not a live reference -- renaming/deleting the
    original in the file manager afterward must not silently break or
    reshare a past chat message)."""
    from storage.services import owner_root, safe_join

    root = owner_root(admin, user)
    try:
        src = safe_join(root, relpath)
    except ValueError:
        raise ValueError("Недопустимый путь")
    if not src.is_file():
        raise ValueError("Файл не найден в хранилище")
    size = src.stat().st_size
    if size > MAX_ATTACHMENT_BYTES:
        raise ValueError(f'Файл "{src.name}" больше 200 МБ — вложите его в чат нельзя, поделитесь ссылкой из "Хранилища"')
    _check_quota(admin, user, size)

    target_dir = owner_root(admin, user) / "chat" / f"conv_{message.conversation_id}"
    target_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}_{re.sub(r'[^a-zA-Z0-9_.-]', '_', src.name)}"
    dest = target_dir / stored_name
    shutil.copyfile(src, dest)

    content_type = mimetypes.guess_type(src.name)[0] or "application/octet-stream"
    return MessageAttachment.objects.create(
        message=message,
        file_path=str((Path("chat") / f"conv_{message.conversation_id}" / stored_name).as_posix()),
        file_name=src.name,
        content_type=content_type,
        kind=_detect_kind(content_type, src.name),
        size_bytes=size,
    )


def save_attachment_to_storage(attachment: MessageAttachment, viewer_admin, viewer_user) -> str:
    """The inverse direction: copies a RECEIVED attachment into the
    viewer's own "Хранилище", under "from_chat/" -- so a document someone
    sent you doesn't only live inside the chat history. Returns the
    saved-to relative path. Caller must have already checked the viewer
    is a participant of the attachment's conversation (chat/views.py)."""
    from storage.services import owner_root, safe_join

    _check_quota(viewer_admin, viewer_user, attachment.size_bytes)

    sender_admin = {"id": attachment.message.sender_admin_id} if attachment.message.sender_admin_id else None
    sender_user = {"id": attachment.message.sender_user_id} if attachment.message.sender_user_id else None
    src = safe_join(owner_root(sender_admin, sender_user), attachment.file_path)
    if not src.is_file():
        raise ValueError("Файл не найден")

    dest_dir = owner_root(viewer_admin, viewer_user) / "from_chat"
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / attachment.file_name
    if dest.exists():
        stem = Path(attachment.file_name).stem
        suffix = Path(attachment.file_name).suffix
        dest = dest_dir / f"{stem}_{uuid.uuid4().hex[:6]}{suffix}"
    shutil.copyfile(src, dest)
    return str((Path("from_chat") / dest.name).as_posix())


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


def send_message_from_storage(conversation: Conversation, admin, user, relpath: str, body: str = "") -> Message:
    if admin:
        sender_kwargs = {"sender_admin_id": admin["id"], "sender_user_id": None}
    else:
        sender_kwargs = {"sender_admin_id": None, "sender_user_id": user["id"]}
    message = Message.objects.create(conversation=conversation, body=(body or "").strip(), **sender_kwargs)
    try:
        attach_storage_file(message, admin, user, relpath)
    except ValueError:
        message.delete()
        raise
    mark_read(conversation, admin, user)
    broadcast_message(message)
    return message
