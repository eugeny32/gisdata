from django.core.management.base import BaseCommand
from apps.users.services import sync_from_mdb_dump


class Command(BaseCommand):
    help = 'Синхронизация пользователей из mdb-дампа'

    def handle(self, *args, **options):
        try:
            count = sync_from_mdb_dump()
            self.stdout.write(self.style.SUCCESS(f"Синхронизировано: {count} пользователей"))
        except Exception as exc:
            self.stderr.write(self.style.ERROR(f"Ошибка: {exc}"))

