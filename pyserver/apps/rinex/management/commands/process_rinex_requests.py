from django.core.management.base import BaseCommand
from rinex.models import RinexRequest
from django.utils import timezone


class Command(BaseCommand):
    help = 'Обработка фоновых RINEX-запросов'

    def handle(self, *args, **options):
        request = RinexRequest.objects.filter(status='pending').order_by('created_at').first()
        if not request:
            self.stdout.write('Нет ожидающих запросов')
            return

        self.stdout.write(f"Обрабатываем запрос #{request.id}")
        # TODO: integrate rinex_merge and gnss_ftp logic here
        # For now, mark as processing to reserve it
        request.status = 'processing'
        request.started_at = timezone.now()
        request.save(update_fields=['status', 'started_at'])
        self.stdout.write(f"Запрошено #{request.id} — обработка в разработке")
