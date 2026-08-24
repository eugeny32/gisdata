"""
Chat business logic -- conversation lookup/creation, unread counts, message
persistence. Kept framework-agnostic (no request/response here) so both the
regular Django views (chat/views.py) and the WebSocket consumer
(chat/consumers.py) can share it without either depending on the other.
"""

from django.db import transaction
from django.utils import timezone

from .models import Conversation, ConversationParticipant, Message


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


def send_message(conversation: Conversation, admin, user, body: str) -> Message:
    if admin:
        sender_kwargs = {"sender_admin_id": admin["id"], "sender_user_id": None}
    else:
        sender_kwargs = {"sender_admin_id": None, "sender_user_id": user["id"]}
    message = Message.objects.create(conversation=conversation, body=body, **sender_kwargs)
    mark_read(conversation, admin, user)  # sending counts as having read up to now
    return message
