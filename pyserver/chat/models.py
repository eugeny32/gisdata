"""
Real-time text chat between platform accounts (Admin XOR UserSync -- same
polymorphic-owner pattern as cad_sessions/models.py and storage/models.py).
Delivery is via Django Channels (see chat/consumers.py) for connected
clients; these tables are the durable history + what makes the unread
badge in the main app's header possible.
"""

from django.db import models

from core.models import Admin
from users.models import UserSync


class Conversation(models.Model):
    is_group = models.BooleanField(default=False)
    # Only meaningful for groups -- direct 1:1 conversations are unnamed,
    # displayed by the OTHER participant's name (see chat/services.py).
    title = models.CharField(max_length=128, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chat_conversations"


class ConversationParticipant(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="participants")
    admin = models.ForeignKey(Admin, on_delete=models.CASCADE, null=True, blank=True, related_name="+")
    user = models.ForeignKey(UserSync, on_delete=models.CASCADE, null=True, blank=True, related_name="+")
    # Everything with Message.created_at <= last_read_at is "read" -- see
    # chat/services.py::unread_count(). NULL = never opened this conversation.
    last_read_at = models.DateTimeField(null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chat_conversation_participants"
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(admin__isnull=False, user__isnull=True)
                    | models.Q(admin__isnull=True, user__isnull=False)
                ),
                name="chk_chat_participant_owner",
            ),
        ]
        indexes = [
            models.Index(fields=["admin", "conversation"], name="idx_chat_participant_admin"),
            models.Index(fields=["user", "conversation"], name="idx_chat_participant_user"),
        ]


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender_admin = models.ForeignKey(Admin, on_delete=models.CASCADE, null=True, blank=True, related_name="+")
    sender_user = models.ForeignKey(UserSync, on_delete=models.CASCADE, null=True, blank=True, related_name="+")
    # Blank when the message is attachment-only (see MessageAttachment) --
    # a message must have a body or at least one attachment, enforced in
    # chat/views.py, not here (an empty-body-and-no-attachment row is
    # harmless, just pointless, not a data-integrity concern worth a
    # DB constraint).
    body = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chat_messages"
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(sender_admin__isnull=False, sender_user__isnull=True)
                    | models.Q(sender_admin__isnull=True, sender_user__isnull=False)
                ),
                name="chk_chat_message_sender",
            ),
        ]
        indexes = [
            models.Index(fields=["conversation", "created_at"], name="idx_chat_messages_conv_time"),
        ]


class MessageAttachment(models.Model):
    KIND_CHOICES = [("image", "Image"), ("video", "Video"), ("document", "Document")]

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="attachments")
    # Relative to storage.services.owner_root(sender) -- lives inside the
    # SENDER's existing per-account storage tree (under "chat/"), so it
    # counts against the same unified 6GB quota as tours/the file manager
    # instead of a second, separately-tracked allowance. Authorization for
    # the OTHER participant to read it is conversation-membership (see
    # chat/views.py::download_attachment_view), NOT storage.models.
    # SharedAccess -- that model is for the file-manager's explicit
    # per-file sharing, a different (and unrelated) grant.
    file_path = models.CharField(max_length=255)
    file_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=128)
    kind = models.CharField(max_length=10, choices=KIND_CHOICES, default="document")
    size_bytes = models.BigIntegerField()

    class Meta:
        db_table = "chat_message_attachments"
