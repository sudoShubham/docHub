from django.urls import path
from .views import RegisterView, LoginView, DocumentUploadView, UserDocumentsView, UpdatePasswordView, AllUserDocumentsView, FolderDocumentsView, UserProfileView, UpdateUserDetailsView, AllUserDetailsView, UpdateUserDetailsView, UpdateUserDetailsViewSelf, ReportingHierarchyView, PublicHolidayView, GetLeaveDetailsView, ApplyLeaveView, UserReportsView, ApproveLeaveView, CancelLeaveRequestView, RejectLeaveView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('upload-documents/', DocumentUploadView.as_view(), name='upload-documents'),
    path('documents/', UserDocumentsView.as_view(), name='user-documents'),
    path("update-password/", UpdatePasswordView.as_view(), name="update-password"),
    path('admin/all-documents/', AllUserDocumentsView.as_view(), name='all_user_documents'),
    path('folder-documents/', FolderDocumentsView.as_view(), name='folder-documents'),
    path('user-profile/', UserProfileView.as_view(), name='user-profile'),
    path('update-profile/', UpdateUserDetailsViewSelf.as_view(), name='update-profile'),
    path('admin/user-details/', AllUserDetailsView.as_view(), name='all_user_details'),
    path('admin/user-update/', UpdateUserDetailsView.as_view(), name='update-user-details'),
    path('reporting-hierarchy/', ReportingHierarchyView.as_view(), name='reporting-hierarchy'),
    path('public-holidays/', PublicHolidayView.as_view(), name='public-holiday-list'),  # GET all holidays or POST a new one
    path('public-holidays/<int:pk>/', PublicHolidayView.as_view(), name='public-holiday-detail'), 
    path('leave/details/', GetLeaveDetailsView.as_view(), name='leave-details'),
    path('leave/apply/', ApplyLeaveView.as_view(), name='apply-leave'),
    path('user-reports/', UserReportsView.as_view(), name='user-reports'),
    path('approve-leave/', ApproveLeaveView.as_view(), name='approve-leave'),
    path('leave/reject/', RejectLeaveView.as_view(), name='reject_leave'),
    path('cancel-leave/<int:leave_request_id>/', CancelLeaveRequestView.as_view(), name='cancel_leave_request'),
]