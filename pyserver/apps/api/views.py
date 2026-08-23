from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from apps.documents.models import Document, DocumentCategory, DocumentTag, UserStorageQuota
from apps.documents.serializers import (
    DocumentSerializer, DocumentCreateSerializer,
    DocumentCategorySerializer, DocumentTagSerializer, QuotaSerializer
)
from apps.core import auth


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        admin = auth.current_admin(request)
        user = auth.current_user(request)
        if admin:
            return True
        if user and obj.owner_user_id == user['id']:
            return True
        return False


class DocumentCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentCategory.objects.all()
    serializer_class = DocumentCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class DocumentTagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentTag.objects.all()
    serializer_class = DocumentTagSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class DocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'file_size']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Document.objects.filter(deleted_at__isnull=True)
        admin = auth.current_admin(self.request)
        user = auth.current_user(self.request)
        if admin:
            pass
        elif user:
            qs = qs.filter(Q(owner_user_id=user['id']) | Q(is_public=True))
        else:
            qs = qs.filter(is_public=True)
        
        category = self.request.query_params.get('category')
        file_type = self.request.query_params.get('file_type')
        is_public = self.request.query_params.get('is_public')
        is_starred = self.request.query_params.get('is_starred')
        
        if category:
            qs = qs.filter(category_id=category)
        if file_type:
            qs = qs.filter(file_type=file_type)
        if is_public is not None:
            qs = qs.filter(is_public=is_public == 'true')
        if is_starred is not None:
            qs = qs.filter(is_starred=is_starred == 'true')
        
        return qs.select_related('owner_admin', 'owner_user', 'category').prefetch_related('tags')

    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentCreateSerializer
        return DocumentSerializer

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def upload_version(self, request, pk=None):
        doc = self.get_object()
        f = request.FILES.get('file')
        if not f:
            return Response({'error': 'Файл не предоставлен'}, status=status.HTTP_400_BAD_REQUEST)
        user = auth.current_user(request)
        admin = auth.current_admin(request)
        if not user and not admin:
            return Response({'error': 'Требуется авторизация'}, status=status.HTTP_401_UNAUTHORIZED)
        
        DocumentVersion.objects.create(
            document=doc, file=f, file_size=f.size,
            created_by_user_id=user['id'] if user else None,
            created_by_admin_id=admin['id'] if admin else None,
            changelog=request.data.get('changelog', '')
        )
        doc.version += 1
        doc.save(update_fields=['version'])
        return Response({'status': 'version uploaded', 'version': doc.version})

    @action(detail=False, methods=['get'])
    def quota(self, request):
        user = auth.current_user(request)
        admin = auth.current_admin(request)
        if not user and not admin:
            return Response({'error': 'Требуется авторизация'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if user:
            quota, _ = UserStorageQuota.objects.get_or_create(
                user_id=user['id'],
                defaults={'limit_bytes': 6 * 1024 ** 3}
            )
        else:
            quota = None
        
        if quota:
            return Response(QuotaSerializer({
                'limit_bytes': quota.limit_bytes,
                'used_bytes': quota.used_bytes,
                'free_bytes': quota.free_bytes,
                'usage_percent': quota.usage_percent,
            }).data)
        return Response(QuotaSerializer({
            'limit_bytes': 6 * 1024 ** 3,
            'used_bytes': 0,
            'free_bytes': 6 * 1024 ** 3,
            'usage_percent': 0,
        }).data)
