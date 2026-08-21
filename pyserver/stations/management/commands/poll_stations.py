"""
Port of bin/poll_stations.php — polls every enabled station and records
status/history. Run every minute via a systemd timer (see
deploy/poll-stations.timer), same cadence as the PHP original under
Windows Task Scheduler.
"""

from django.core.management.base import BaseCommand

from stations.models import Station
from stations.services import poll_stations


class Command(BaseCommand):
    help = "Poll all enabled NTRIP stations and record status/history."

    def handle(self, *args, **options):
        stations = list(Station.objects.filter(is_enabled=1))
        counts = poll_stations(stations)
        self.stdout.write(
            f"Polled {len(stations)} station(s): "
            f"online={counts.get('online', 0)} offline={counts.get('offline', 0)}"
        )