from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from apps.core import auth
from .models import Document, DocumentCategory, DocumentTag, UserStorageQuota


class DocumentListView:
    def __call__(self, request):
        if not auth.current_user(request) and not auth.current_admin(request):
            return redirect('login')

        qs = Document.objects.filter(deleted_at__isnull=True)
        q = request.GET.get('q')
        category = request.GET.get('category')
        tag = request.GET.get('tag')
        file_type = request.GET.get('type')

        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))
        if category:
            qs = qs.filter(category__slug=category)
        if tag:
            qs = qs.filter(tags__name=tag)
        if file_type:
            qs = qs.filter(file_type=file_type)

        admin = auth.current_admin(request)
        user = auth.current_user(request)
        if not admin and user:
            qs = qs.filter(Q(owner_user_id=user['id']) | Q(is_public=True))
        elif not admin:
            qs = qs.filter(is_public=True)

        documents = qs.select_related('owner_admin', 'owner_user', 'category').prefetch_related('tags').distinct()[:50]

        categories = DocumentCategory.objects.all()
        tags = DocumentTag.objects.all()
        file_types = Document.FILE_TYPES

        quota = None
        if user:
            try:
                quota = UserStorageQuota.objects.get(user_id=user['id'])
            except UserStorageQuota.DoesNotExist:
                pass

        return render(request, 'documents/list.html', {
            'documents': documents,
            'categories': categories,
            'tags': tags,
            'file_types': file_types,
            'quota': quota,
        })


class DocumentUploadView:
    def __call__(self, request):
        if not auth.current_user(request) and not auth.current_admin(request):
            return redirect('login')

        if request.method == 'POST':
            title = request.POST.get('title', '').strip()
            description = request.POST.get('description', '').strip()
            category_id = request.POST.get('category')
            is_public = bool(request.POST.get('is_public'))
            uploaded_file = request.FILES.get('file')

            if not title or not uploaded_file:
                return render(request, 'documents/upload.html', {
                    'error': 'Заполните название и выберите файл',
                    'categories': DocumentCategory.objects.all(),
                    'file_types': Document.FILE_TYPES,
                })

            admin = auth.current_admin(request)
            user = auth.current_user(request)

            doc = Document(
                title=title,
                description=description,
                file=uploaded_file,
                is_public=is_public,
                owner_admin_id=admin['id'] if admin else None,
                owner_user_id=user['id'] if user else None,
            )
            if category_id:
                doc.category_id = category_id
            doc.save()

            tag_ids = request.POST.getlist('tags')
            if tag_ids:
                doc.tags.set(tag_ids)

            return redirect('documents:detail', pk=doc.pk)

        categories = DocumentCategory.objects.all()
        return render(request, 'documents/upload.html', {
            'categories': categories,
            'file_types': Document.FILE_TYPES,
        })


class DocumentDetailView:
    def __call__(self, request, pk):
        if not auth.current_user(request) and not auth.current_admin(request):
            return redirect('login')

        doc = get_object_or_404(Document, pk=pk, deleted_at__isnull=True)
        admin = auth.current_admin(request)
        user = auth.current_user(request)

        if not admin and user:
            can_view = doc.owner_user_id == user['id'] or doc.is_public
        else:
            can_view = admin or doc.is_public

        if not can_view:
            return redirect('login')

        return render(request, 'documents/detail.html', {'document': doc})


class DocumentDownloadView:
    def __call__(self, request, pk):
        if not auth.current_user(request) and not auth.current_admin(request):
            return redirect('login')

        doc = get_object_or_404(Document, pk=pk, deleted_at__isnull=True)
        admin = auth.current_admin(request)
        user = auth.current_user(request)

        if not admin and user:
            can_download = doc.owner_user_id == user['id'] or doc.is_public
        else:
            can_download = admin or doc.is_public

        if not can_download:
            return redirect('login')

        import os
        file_name = os.path.basename(doc.file.name)
        response = render(request, 'documents/detail.html', {'document': doc})
        response['Content-Disposition'] = f'attachment; filename="{file_name}"'
        return response


class CategoryListView:
    def __call__(self, request):
        if not auth.current_user(request) and not auth.current_admin(request):
            return redirect('login')
        categories = DocumentCategory.objects.all()
        return render(request, 'documents/categories.html', {'categories': categories})


class TagListView:
    def __call__(self, request):
        if not auth.current_user(request) and not auth.current_admin(request):
            return redirect('login')
        tags = DocumentTag.objects.all()
        return render(request, 'documents/tags.html', {'tags': tags})


document_list = DocumentListView()
document_upload = DocumentUploadView()
document_detail = DocumentDetailView()
document_download = DocumentDownloadView()
category_list = CategoryListView()
tag_list = TagListView()
