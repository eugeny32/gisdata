from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import DocumentViewSet, DocumentCategoryViewSet, DocumentTagViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'categories', DocumentCategoryViewSet, basename='category')
router.register(r'tags', DocumentTagViewSet, basename='tag')

urlpatterns = [
    path('', include(router.urls)),
]
