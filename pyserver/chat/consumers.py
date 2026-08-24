"""
WebSocket delivery for chat/<conversation_id>/ -- one channel-layer group
per conversation, membership checked against ConversationParticipant
(chat/services.py::is_participant) on connect. Message persistence and the
REST fallback endpoint (chat/views.py) share the same
chat/services.py::send_message() so a message sent via either path is
identical in the database and broadcast to WS-connected participants.

Auth: this app has no django.contrib.auth (see core/auth.py's module
docstring) -- AuthMiddlewareStack doesn't apply. gisdata/asgi.py wires
SessionMiddlewareStack only, so self.scope["session"] is a plain Django
session store; identity comes from core.auth.user_from_session()/
admin_from_session() reading the same session keys core/auth.py's
request-based current_user()/current_admin() use.
"""

import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from core import auth

from . import services
from .models import Conversation


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.admin, self.user = await self._resolve_identity()
        if not self.admin and not self.user:
            await self.close(code=4401)
            return

        self.conversation_id = int(self.scope["url_route"]["kwargs"]["conversation_id"])
        allowed = await self._is_participant()
        if not allowed:
            await self.close(code=4403)
            return

        self.group_name = f"chat_{self.conversation_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            payload = json.loads(text_data or "{}")
        except (ValueError, TypeError):
            return
        body = (payload.get("body") or "").strip()
        if not body:
            return

        message = await self._save_message(body)
        await self.channel_layer.group_send(self.group_name, {
            "type": "chat.message",
            "message": {
                "id": message.id,
                "conversation_id": self.conversation_id,
                "body": message.body,
                "sender_label": services.actor_label(self.admin, self.user),
                "sender_admin_id": message.sender_admin_id,
                "sender_user_id": message.sender_user_id,
                "created_at": message.created_at.isoformat(),
            },
        })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"], ensure_ascii=False))

    @database_sync_to_async
    def _resolve_identity(self):
        # SessionMiddlewareStack's scope["session"] is a lazy Django
        # session store -- its first .get() triggers a DB read
        # (SessionBase._get_session_from_db), which Django refuses to run
        # in this async method directly (SynchronousOnlyOperation). Must
        # go through database_sync_to_async, same as every other ORM/
        # session touch in this consumer.
        session = self.scope["session"]
        return auth.admin_from_session(session), auth.user_from_session(session)

    @database_sync_to_async
    def _is_participant(self) -> bool:
        conversation = Conversation.objects.filter(id=self.conversation_id).first()
        if not conversation:
            return False
        return services.is_participant(conversation, self.admin, self.user)

    @database_sync_to_async
    def _save_message(self, body: str):
        conversation = Conversation.objects.get(id=self.conversation_id)
        return services.send_message(conversation, self.admin, self.user, body)
