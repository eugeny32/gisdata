"""
HTTP -> plain Django (unused in production; gunicorn serves HTTP via
gisdata.wsgi, see gisdata.service). WebSocket -> chat/consumers.py, routed
through SessionMiddlewareStack only (NOT Channels' AuthMiddlewareStack --
this project has no django.contrib.auth, see core/auth.py's module
docstring; the consumer reads request identity straight out of the session
via core.auth.admin_from_session()/user_from_session()).
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.sessions import SessionMiddlewareStack
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gisdata.settings")

django_asgi_app = get_asgi_application()

# Imported after get_asgi_application() -- Channels' own app-loading order
# requirement (importing app code before Django's app registry is ready
# raises AppRegistryNotReady).
from chat.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": SessionMiddlewareStack(URLRouter(websocket_urlpatterns)),
})
