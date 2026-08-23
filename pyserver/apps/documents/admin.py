from django.contrib import admin
from .models import Document, DocumentCategory, DocumentTag, UserStorageQuota, DocumentVersion, DocumentAccessLog


@admin.register(DocumentCategory)
class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'is_public', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(DocumentTag)
class DocumentTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color']
    search_fields = ['name']


@admin.register(UserStorageQuota)
class UserStorageQuotaAdmin(admin.ModelAdmin):
    list_display = ['user', 'limit_bytes', 'used_bytes', 'free_bytes', 'usage_percent']
    list_filter = ['user']
    readonly_fields = ['used_bytes', 'updated_at']


class DocumentVersionInline(admin.TabularInline):
    model = DocumentVersion
    extra = 0
    readonly_fields = ['file', 'file_size', 'created_at', 'created_by_admin', 'created_by_user']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner_admin', 'owner_user', 'category', 'file_type', 'file_size', 'is_public', 'is_starred', 'version', 'created_at']
    list_filter = ['file_type', 'is_public', 'is_starred', 'category', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['file_size', 'version', 'created_at', 'updated_at']
    inlines = [DocumentVersionInline]
    filter_horizontal = ['tags']


@admin.register(DocumentAccessLog)
class DocumentAccessLogAdmin(admin.ModelAdmin):
    list_display = ['document', 'user_admin', 'user_user', 'action', 'ip_address', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['document__title']
    readonly_fields = ['document', 'user_admin', 'user_user', 'action', 'ip_address', 'user_agent', 'created_at']
