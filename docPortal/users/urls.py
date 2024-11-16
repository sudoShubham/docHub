from django.urls import path
from .views import RegisterView, LoginView, DocumentUploadView, UserDocumentsView, UpdatePasswordView, AllUserDocumentsView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('upload-documents/', DocumentUploadView.as_view(), name='upload-documents'),
    path('documents/', UserDocumentsView.as_view(), name='user-documents'),
    path("update-password/", UpdatePasswordView.as_view(), name="update-password"),
    path('admin/all-documents/', AllUserDocumentsView.as_view(), name='all_user_documents'),
]