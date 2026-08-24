"""
Token minting for the ALREADY-RUNNING ~/ntrip_coturn infrastructure
(LiveKit SFU + coturn) -- see the plan doc's architecture note. This is a
Python port of that project's own server/token-service.mjs, producing
byte-for-byte the same JWT/TURN-credential shapes it does, just minted for
a gisdata-authenticated identity instead of its shared access code.

Deliberately NOT calling into token-service.mjs over HTTP: that service's
whole design is "hand out access to anyone who knows the meeting code",
which is the wrong trust model for per-account chat calls -- gisdata's own
session auth (core/auth.py) is the actual gate here, so minting directly
with the shared LiveKit/TURN secrets (read once via sudo, see the .env
entries this module reads) is the correct boundary, not a bigger one.
"""

import base64
import hashlib
import hmac
import json
import re
import time
import uuid

from django.conf import settings

CALL_TTL_SECONDS = 3600
_IDENTITY_SAFE_RE = re.compile(r"[^a-zA-Z0-9_-]")


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _livekit_token(*, room: str, identity: str, name: str) -> str:
    now = int(time.time())
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "iss": settings.LIVEKIT_API_KEY,
        "sub": identity,
        "nbf": now - 10,
        "exp": now + CALL_TTL_SECONDS,
        "name": name,
        "video": {
            "room": room,
            "roomJoin": True,
            "canPublish": True,
            "canSubscribe": True,
            "canPublishData": True,
        },
    }
    signing_input = f"{_b64url(json.dumps(header).encode())}.{_b64url(json.dumps(payload).encode())}"
    sig = _b64url(hmac.new(settings.LIVEKIT_API_SECRET.encode(), signing_input.encode(), hashlib.sha256).digest())
    return f"{signing_input}.{sig}"


def _turn_ice_servers(turn_id: str) -> list[dict]:
    """TURN REST API time-limited credentials (coturn's use-auth-secret
    scheme) -- identical construction to token-service.mjs::iceServers().
    Relay-only by design (client sets iceTransportPolicy: 'relay'): no
    STUN, no local candidates leaked, matching that project's own
    reasoning (calling someone shouldn't expose your LAN/public IP)."""
    expiry = int(time.time()) + CALL_TTL_SECONDS
    username = f"{expiry}:{turn_id}"
    credential = base64.b64encode(
        hmac.new(settings.TURN_STATIC_AUTH_SECRET.encode(), username.encode(), hashlib.sha1).digest()
    ).decode("ascii")

    urls = []
    if settings.TURN_UDP_PORT:
        urls.append(f"turn:{settings.TURN_DOMAIN}:{settings.TURN_UDP_PORT}?transport=udp")
    urls.append(f"turns:{settings.TURN_DOMAIN}:443?transport=tcp")

    return [{"urls": urls, "username": username, "credential": credential}]


def mint_call_access(*, room: str, login: str, display_name: str) -> dict:
    """room: caller-supplied, must already be _ROOM_RE-safe (see
    chat/views.py -- built from a numeric conversation id, always safe).
    login: the gisdata account's ASCII login/user_name -- LiveKit
    identities must be ASCII (SASLprep on the STUN USERNAME attribute, same
    reasoning as token-service.mjs's own uid-based identity)."""
    safe_login = _IDENTITY_SAFE_RE.sub("", login) or "user"
    identity = f"{safe_login}-{uuid.uuid4().hex[:8]}"
    turn_id = f"u{uuid.uuid4().hex[:8]}"
    return {
        "ws_url": settings.LIVEKIT_WS_URL,
        "token": _livekit_token(room=room, identity=identity, name=display_name),
        "identity": identity,
        "ice_servers": _turn_ice_servers(turn_id),
        "ttl": CALL_TTL_SECONDS,
    }
