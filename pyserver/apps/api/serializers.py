from rest_framework import serializers
from rest_framework.reverse import reverse
from apps.documents.models import Document, DocumentCategory, DocumentTag, UserStorageQuota
from apps.core import auth


class DocumentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentCategory
        fields = ['id', 'name', 'slug', 'parent', 'description', 'icon', 'is_public']


class DocumentTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTag
        fields = ['id', 'name', 'color']


class DocumentSerializer(serializers.ModelSerializer):
    owner_admin = serializers.StringRelatedField()
    owner_user = serializers.StringRelatedField()
    category = DocumentCategorySerializer(read_only=True)
    tags = DocumentTagSerializer(many=True, read_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'file', 'file_type', 'file_size',
            'mime_type', 'is_public', 'is_starred', 'owner_admin', 'owner_user',
            'category', 'tags', 'version', 'created_at', 'updated_at', 'download_url',
        ]
        read_only_fields = ['owner_admin', 'owner_user', 'file_size', 'version', 'created_at', 'updated_at']

    def get_download_url(self, obj):
        request = self.context.get('request')
        if request is None:
            return None
        return reverse('documents:download', kwargs={'pk': obj.pk}, request=request)


class DocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['title', 'description', 'file', 'category', 'tags', 'is_public']

    def create(self, validated_data):
        request = self.context.get('request')
        admin = auth.current_admin(request)
        user = auth.current_user(request)
        validated_data['owner_admin_id'] = admin['id'] if admin else None
        validated_data['owner_user_id'] = user['id'] if user else None
        return super().create(validated_data)


class QuotaSerializer(serializers.Serializer):
    limit_bytes = serializers.IntegerField()
    used_bytes = serializers.IntegerField()
    free_bytes = serializers.IntegerField()
    usage_percent = serializers.IntegerField()
