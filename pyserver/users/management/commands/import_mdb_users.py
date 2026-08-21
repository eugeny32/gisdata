from django.core.management.base import BaseCommand

from users.services import sync_from_mdb_dump


class Command(BaseCommand):
    help = "Import users_sync from the JSON dump produced by bin/export_mdb_users.py."

    def handle(self, *args, **options):
        count = sync_from_mdb_dump()
        self.stdout.write(f"Synced {count} users from mdb dump")