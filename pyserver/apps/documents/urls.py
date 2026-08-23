from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
    path('', views.document_list, name='list'),
    path('upload/', views.document_upload, name='upload'),
    path('<int:pk>/', views.document_detail, name='detail'),
    path('<int:pk>/download/', views.document_download, name='download'),
    path('categories/', views.category_list, name='categories'),
    path('tags/', views.tag_list, name='tags'),
]
