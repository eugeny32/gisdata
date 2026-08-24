"""
Django ships its own `createsuperuser` for django.contrib.auth.User, which
this project doesn't use (see core/models.py::Admin -- a dual-identity
session model predating this rewrite, ported as-is from the PHP original's
`admins` table rather than adopted into django.contrib.auth, see the
migration plan Sec.2). This command mirrors the real createsuperuser's UX
(interactive prompts, --noinput + env vars for scripted use) for THIS
project's actual privileged account type: an Admin row with role='admin'.

Overwrites this app's built-in createsuperuser -- core.apps.CoreConfig
"""

import getpass
import os

from django.core.management.base import BaseCommand, CommandError

from core.auth import set_admin_password
from core.models import Admin


class Command(BaseCommand):
    help = "Create an Admin (role='admin') account -- this project's equivalent of Django's createsuperuser."

    def add_arguments(self, parser):
        parser.add_argument("--login", help="Login name (prompted if omitted).")
        parser.add_argument(
            "--noinput", "--no-input", action="store_false", dest="interactive", default=True,
            help="Read GISDATA_SUPERUSER_LOGIN/GISDATA_SUPERUSER_PASSWORD from the environment instead of prompting.",
        )

    def handle(self, *args, **options):
        if options["interactive"]:
            login = options["login"] or input("Login: ").strip()
            if not login:
                raise CommandError("Login не может быть пустым")
            if Admin.objects.filter(login=login).exists():
                raise CommandError(f"Admin с login={login!r} уже существует")
            password = getpass.getpass("Password: ")
            password2 = getpass.getpass("Password (again): ")
            if password != password2:
                raise CommandError("Пароли не совпадают")
            if len(password) < 8:
                raise CommandError("Пароль слишком короткий (минимум 8 символов)")
        else:
            login = options["login"] or os.environ.get("GISDATA_SUPERUSER_LOGIN")
            password = os.environ.get("GISDATA_SUPERUSER_PASSWORD")
            if not login or not password:
                raise CommandError(
                    "--noinput требует --login и переменную окружения GISDATA_SUPERUSER_PASSWORD"
                )
            if Admin.objects.filter(login=login).exists():
                raise CommandError(f"Admin с login={login!r} уже существует")

        admin = Admin(login=login, role="admin", is_active=1)
        set_admin_password(admin, password)
        admin.save()
        self.stdout.write(self.style.SUCCESS(f"Создан admin: login={login!r}, role=admin, id={admin.id}"))
