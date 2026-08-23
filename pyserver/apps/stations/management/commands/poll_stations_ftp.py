from django.core.management.base import BaseCommand
from apps.stations.models import Station
from apps.stations.services import poll_stations_ftp


class Command(BaseCommand):
    help = 'Резервный опрос станций по FTP (gnss.host)'

    def handle(self, *args, **options):
        stations = list(Station.objects.filter(is_enabled=1))
        count = poll_stations_ftp(stations)
        self.stdout.write(f"Проверено по FTP: {count} станций")


