"""
WebSocket delivery for chat/<conversation_id>/ -- one channel-layer group
per conversation, membership checked against ConversationParticipant
(chat/services.py::is_participant) on connect. Message persistence AND the
broadcast to every connected participant both happen inside
chat/services.py::send_message() -- shared with the REST fallback
(chat/views.py::send_message_view) so a message sent via either path is
identical in the database and reaches WS-connected clients the same way.

Also relays call signaling (chat/livekit.py mints the actual LiveKit
tokens over REST; this just tells the other participant's browser "a call
is starting" so it can show a ringing UI before it has joined the LiveKit
room itself) -- two message shapes on the same socket, distinguished by
the client on whether the frame has a "signal_type" key.

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

_SIGNAL_TYPES = {"call_invite", "call_answer", "call_decline", "call_cancel", "call_end"}


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

        signal_type = payload.get("type")
        if signal_type in _SIGNAL_TYPES:
            await self.channel_layer.group_send(self.group_name, {
                "type": "chat.signal",
                "signal": {
                    "signal_type": signal_type,
                    "conversation_id": self.conversation_id,
                    "from_label": services.actor_label(self.admin, self.user),
                    "from_admin_id": self.admin["id"] if self.admin else None,
                    "from_user_id": self.user["id"] if self.user else None,
                },
                "sender_channel": self.channel_name,
            })
            return

        body = (payload.get("body") or "").strip()
        if not body:
            return
        try:
            await self._send_text(body)
        except ValueError:
            pass  # empty-after-strip race -- nothing to persist, nothing to report over a fire-and-forget send

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"], ensure_ascii=False))

    async def chat_signal(self, event):
        # Don't echo a call signal back to the tab that sent it -- unlike
        # chat_message (where seeing your own message reflected back is
        # the point), the caller's own UI already knows it just clicked
        # "call"/"hang up" and manages its own state locally.
        if event.get("sender_channel") == self.channel_name:
            return
        await self.send(text_data=json.dumps(event["signal"], ensure_ascii=False))

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
    def _send_text(self, body: str):
        conversation = Conversation.objects.get(id=self.conversation_id)
        return services.send_message(conversation, self.admin, self.user, body)
