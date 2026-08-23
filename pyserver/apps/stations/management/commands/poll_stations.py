from django.core.management.base import BaseCommand
from apps.stations.services import poll_stations
from apps.stations.models import Station


class Command(BaseCommand):
    help = 'Опрос всех включённых NTRIP-станций'

    def add_arguments(self, parser):
        parser.add_argument('--cron-token', help='Cron token for web-triggered runs')

    def handle(self, *args, **options):
        stations = list(Station.objects.filter(is_enabled=1))
        counts = poll_stations(stations)
        self.stdout.write(
            f"Проверено станций: {len(stations)} (online: {counts.get('online', 0)}, offline: {counts.get('offline', 0)})"
        )


