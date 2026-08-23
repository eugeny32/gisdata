"""
Internal file storage and cataloging system.

Features:
- Document upload with automatic type detection
- Hierarchical categories (MPTT)
- Tagging with colors
- Per-user storage quota (6 GB default)
- Versioning (each upload creates a new version)
- Soft delete
- Full-text search via PostgreSQL GIN index
- Access audit log

Owner model: dual-identity (Admin OR UserSync), mirroring the rest of the
codebase's auth pattern. A document belongs to EITHER an admin OR a regular
user, never both.
"""

from django.db import models
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex

from apps.core.models import Admin
from apps.users.models import UserSync


class DocumentCategory(models.Model):
    """Hierarchical category tree for documents."""

    name = models.CharField(max_length=128)
    slug = models.SlugField(max_length=128, unique=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
    )
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=64, blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']

    def __str__(self):
        return self.name


class DocumentTag(models.Model):
    """Flat tagging system with optional color."""

    name = models.CharField(max_length=64, unique=True)
    color = models.CharField(max_length=7, default='#0d6efd')

    class Meta:
        verbose_name = 'Тег'
        verbose_name_plural = 'Теги'

    def __str__(self):
        return self.name


class UserStorageQuota(models.Model):
    """Per-user storage quota tracking."""

    user = models.OneToOneField(
        UserSync,
        on_delete=models.CASCADE,
        related_name='storage_quota',
    )
    limit_bytes = models.BigIntegerField(default=6 * 1024 ** 3)
    used_bytes = models.BigIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Квота хранилища'
        verbose_name_plural = 'Квоты хранилища'

    def __str__(self):
        return f"{self.user} — {self.used_bytes}/{self.limit_bytes}"

    @property
    def free_bytes(self):
        return max(self.limit_bytes - self.used_bytes, 0)

    @property
    def usage_percent(self):
        if self.limit_bytes == 0:
            return 100
        return min(100, int(self.used_bytes * 100 / self.limit_bytes))


class Document(models.Model):
    """Core document entity with metadata, versioning, and soft delete."""

    FILE_TYPES = [
        ('image', 'Изображение'),
        ('pdf', 'PDF'),
        ('doc', 'Документ (Word/Excel/PPT)'),
        ('archive', 'Архив'),
        ('video', 'Видео'),
        ('audio', 'Аудио'),
        ('model', '3D-модель'),
        ('other', 'Другое'),
    ]

    owner_admin = models.ForeignKey(
        Admin,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='documents',
    )
    owner_user = models.ForeignKey(
        UserSync,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='documents',
    )
    category = models.ForeignKey(
        DocumentCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents',
    )
    tags = models.ManyToManyField(DocumentTag, blank=True, related_name='documents')

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPES, default='other')
    file_size = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=128, blank=True)

    is_public = models.BooleanField(default=False)
    is_starred = models.BooleanField(default=False)

    search_vector = SearchVectorField(null=True)

    metadata = models.JSONField(default=dict, blank=True)
    version = models.PositiveIntegerField(default=1)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='versions',
    )

    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            GinIndex(fields=['search_vector']),
            models.Index(fields=['owner_admin', 'owner_user', 'category', 'created_at']),
            models.Index(fields=['is_public', 'created_at']),
        ]
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(owner_admin__isnull=False, owner_user__isnull=True)
                    | models.Q(owner_admin__isnull=True, owner_user__isnull=False)
                ),
                name='chk_document_owner',
            ),
        ]

    def __str__(self):
        return self.title

    @property
    def owner(self):
        return self.owner_admin or self.owner_user

    def save(self, *args, **kwargs):
        if self.file and not self.file_size:
            self.file_size = self.file.size
            name = self.file.name.lower()
            if name.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp')):
                self.file_type = 'image'
            elif name.endswith('.pdf'):
                self.file_type = 'pdf'
            elif name.endswith(('.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp')):
                self.file_type = 'doc'
            elif name.endswith(('.zip', '.rar', '.7z', '.tar', '.gz', '.bz2')):
                self.file_type = 'archive'
            elif name.endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm')):
                self.file_type = 'video'
            elif name.endswith(('.mp3', '.wav', '.ogg', '.flac', '.aac')):
                self.file_type = 'audio'
            elif name.endswith(('.ply', '.splat', '.ksplat', '.las', '.laz', '.copc', '.glb', '.gltf')):
                self.file_type = 'model'
        super().save(*args, **kwargs)


class DocumentVersion(models.Model):
    """Historical version of a document file."""

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='file_versions')
    file = models.FileField(upload_to='documents/versions/%Y/%m/%d/')
    file_size = models.BigIntegerField(default=0)
    changelog = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by_admin = models.ForeignKey(
        Admin, on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    created_by_user = models.ForeignKey(
        UserSync, on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(created_by_admin__isnull=False, created_by_user__isnull=True)
                    | models.Q(created_by_admin__isnull=True, created_by_user__isnull=False)
                ),
                name='chk_document_version_creator',
            ),
        ]

    def __str__(self):
        return f"{self.document.title} v{self.document.version}"


class DocumentAccessLog(models.Model):
    """Audit log for document access."""

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='access_logs')
    user_admin = models.ForeignKey(
        Admin, on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    user_user = models.ForeignKey(
        UserSync, on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )
    action = models.CharField(max_length=32)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['document', 'created_at'])]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(user_admin__isnull=False, user_user__isnull=True)
                    | models.Q(user_admin__isnull=True, user_user__isnull=False)
                ),
                name='chk_access_log_user',
            ),
        ]

    def __str__(self):
        return f"{self.document} — {self.action}"
