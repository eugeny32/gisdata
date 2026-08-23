from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.postgres.search import SearchVector

from .models import Document, DocumentVersion, UserStorageQuota


def _recalculate_quota(user_id):
    quota, _ = UserStorageQuota.objects.get_or_create(user_id=user_id)
    used = sum(
        d.file_size for d in Document.objects.filter(
            owner_user_id=user_id, deleted_at__isnull=True
        )
    )
    quota.used_bytes = used
    quota.save(update_fields=['used_bytes'])


@receiver(post_save, sender=Document)
def update_search_vector(sender, instance, **kwargs):
    if instance.deleted_at is None:
        Document.objects.filter(pk=instance.pk).update(
            search_vector=SearchVector('title', weight='A') + SearchVector('description', weight='B')
        )


@receiver(post_save, sender=Document)
def update_quota_on_save(sender, instance, **kwargs):
    if instance.owner_user_id:
        _recalculate_quota(instance.owner_user_id)


@receiver(post_delete, sender=Document)
def update_quota_on_delete(sender, instance, **kwargs):
    if instance.owner_user_id:
        _recalculate_quota(instance.owner_user_id)


@receiver(post_save, sender=DocumentVersion)
def update_quota_on_version(sender, instance, **kwargs):
    if instance.created_by_user_id:
        _recalculate_quota(instance.created_by_user_id)
