"""Direct port of subscriptions.php."""

import json

from django.shortcuts import redirect, render
from django.utils import timezone

from apps.core import auth
from apps.users.models import UserSync

from .models import Subscription


def _subscription_status(subs):
    now = timezone.now()
    for s in subs:
        if not s.is_cancelled and s.ends_at > now:
            return "active", s
    return ("expired", subs[0]) if subs else ("none", None)


@auth.require_admin_role("admin")
def subscriptions_view(request):
    error = None
    admin = auth.current_admin(request)

    if request.method == "POST":
        action = request.POST.get("action", "")
        if action == "create":
            user_id = int(request.POST.get("user_id") or 0)
            plan_name = request.POST.get("plan_name", "").strip() or None
            ends_at = request.POST.get("ends_at", "").strip()
            note = request.POST.get("note", "").strip() or None
            if user_id <= 0 or not ends_at:
                error = "Р’С‹Р±РµСЂРёС‚Рµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ Рё СѓРєР°Р¶РёС‚Рµ РґР°С‚Сѓ РѕРєРѕРЅС‡Р°РЅРёСЏ РїРѕРґРїРёСЃРєРё"
            else:
                Subscription.objects.create(
                    user_id=user_id, plan_name=plan_name, ends_at=ends_at,
                    note=note, created_by_id=admin["id"],
                )
                return redirect("subscriptions")
        elif action == "cancel":
            sub_id = int(request.POST.get("id") or 0)
            Subscription.objects.filter(id=sub_id).update(is_cancelled=1)
            return redirect("subscriptions")

    users = UserSync.objects.order_by("user_name")
    subs_by_user = {}
    for s in Subscription.objects.order_by("-ends_at"):
        subs_by_user.setdefault(s.user_id, []).append(s)

    modal_data = {}
    now = timezone.now()
    for u in users:
        subs = subs_by_user.get(u.id, [])
        status, sub = _subscription_status(subs)
        modal_data[u.id] = {
            "userName": u.user_name,
            "status": status,
            "activeSubId": sub.id if status == "active" else None,
            "planName": sub.plan_name if sub else "",
            "endsAt": sub.ends_at.strftime("%Y-%m-%d") if sub else "",
            "history": [
                {
                    "planName": h.plan_name or "вЂ”",
                    "startsAt": h.starts_at.strftime("%Y-%m-%d"),
                    "endsAt": h.ends_at.strftime("%Y-%m-%d"),
                    "status": "РѕС‚РѕР·РІР°РЅР°" if h.is_cancelled else ("Р°РєС‚РёРІРЅР°" if h.ends_at > now else "РёСЃС‚РµРєР»Р°"),
                    "note": h.note or "",
                }
                for h in subs
            ],
        }

    return render(request, "billing/list.html", {
        "error": error, "users": users, "modal_data": modal_data,
        "modal_data_json": json.dumps(modal_data, ensure_ascii=False, default=str),
    })
