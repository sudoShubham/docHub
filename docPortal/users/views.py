from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.permissions import IsAuthenticated
from .google_drive_service import get_drive_service, get_or_create_folder, upload_file_with_versioning, share_folder_with_email

from rest_framework import status
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import User

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = User.objects.filter(email=email).first()

            if user and user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'user': UserSerializer(user).data,
                })
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

# class DocumentUploadView(APIView):
#     def post(self, request):
#         user_folder_name = f"{request.user.username}"
#         service = get_drive_service()  # Get the service object to interact with Google Drive

#         # Assuming 'root' folder for parent folder (can be customized)
#         parent_folder_id = '1FfiXiFcl1RFW_7p_45KBHP8d0LfRWWL6'  # You can replace this with a specific folder ID if required

#         # Create folder if it doesn't exist (or retrieve existing folder ID if applicable)
#         folder_id = get_or_create_folder(service, parent_folder_id, user_folder_name)

#         # Share the folder with 'dochub.fileserver@gmail.com'
#         try:
#             share_folder_with_email(service, folder_id, 'dochub.fileserver@gmail.com')
#         except Exception as e:
#             print(f"Error sharing folder with dochub.fileserver@gmail.com: {str(e)}")
#             # Optionally, you can return an error response here

#         # Upload files and collect their URLs
#         uploaded_files_info = []
#         for file_key, file in request.FILES.items():
#             file_info = upload_file(service, folder_id, file)
#             uploaded_files_info.append(file_info)

#         return Response({
#             'uploaded_files': uploaded_files_info
#         })

class DocumentUploadView(APIView):
    def post(self, request):
        user_folder_name = f"{request.user.username}"
        service = get_drive_service()  # Get the service object to interact with Google Drive

        # Root folder or specific folder ID for the user's files
        parent_folder_id = '1FfiXiFcl1RFW_7p_45KBHP8d0LfRWWL6'

        # Create or retrieve the user folder within the parent folder
        folder_id = get_or_create_folder(service, parent_folder_id, user_folder_name)

        # Share the folder with 'dochub.fileserver@gmail.com'
        try:
            share_folder_with_email(service, folder_id, 'dochub.fileserver@gmail.com')
        except Exception as e:
            print(f"Error sharing folder with dochub.fileserver@gmail.com: {str(e)}")
            # Optionally, handle or return an error response here

        # Upload files with versioning and collect their URLs
        uploaded_files_info = []
        for file_key, file in request.FILES.items():
            file_info = upload_file_with_versioning(service, folder_id, file)
            uploaded_files_info.append(file_info)

        return Response({
            'uploaded_files': uploaded_files_info
        })