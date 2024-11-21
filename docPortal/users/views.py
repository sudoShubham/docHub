from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import ValidationError
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated
from googleapiclient.errors import HttpError
from .google_drive_service import get_drive_service, get_or_create_folder, upload_file_with_versioning, share_folder_with_email, list_files_in_folder

from rest_framework import status
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import User, UserDetails

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
                    'user': {
                        **UserSerializer(user).data,
                        'is_staff': user.is_staff  # Add staff status here
                    }
                })
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not old_password or not new_password or not confirm_password:
            return Response(
                {"error": "All fields (old_password, new_password, confirm_password) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not check_password(old_password, user.password):
            return Response(
                {"error": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {"error": "New password and confirm password do not match."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update the user's password
        user.set_password(new_password)
        user.save()

        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)

  

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

        # Upload files with versioning and collect their URLs
        uploaded_files_info = []
        for file_key, file in request.FILES.items():
            # file_key will be the document type, like 'aadharCard', 'panCard', etc.
            file_info = upload_file_with_versioning(service, folder_id, file)
            uploaded_files_info.append(file_info)

        return Response({
            'uploaded_files': uploaded_files_info
        })



class UserDocumentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get user data from the request
            user_folder_name = f"{request.user.username}"
            
            # Initialize Google Drive service
            service = get_drive_service()

            # Waynautic folder ID (This should be the parent folder where user folders are stored)
            waynautic_folder_id = '1FfiXiFcl1RFW_7p_45KBHP8d0LfRWWL6'

            # Get or create user folder in the Waynautic folder
            user_folder_id = get_or_create_folder(service, waynautic_folder_id, user_folder_name)
            
            # Fetch the files in the user's folder
            files = list_files_in_folder(service, user_folder_id)
            
            # Prepare response data
            file_data = [
                {
                    'file_id': file['id'],
                    'file_name': file['name'],
                    'file_type': file['mimeType'],
                    'file_url': file['webViewLink']
                }
                for file in files
            ]
            
            return Response({'documents': file_data})

        except Exception as e:
            return Response({'error': str(e)}, status=500)
        


class AllUserDocumentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if the logged-in user is an admin
        if not request.user.is_staff:  # Or use `is_superuser` based on your admin definition
            return Response(
                {"error": "You do not have permission to access this resource."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Initialize Google Drive service
            service = get_drive_service()

            # Waynautic folder ID (Root folder for all user documents)
            waynautic_folder_id = '1FfiXiFcl1RFW_7p_45KBHP8d0LfRWWL6'

            # List all user folders within the Waynautic folder
            user_folders = list_files_in_folder(service, waynautic_folder_id)
            
            # Initialize the response data structure
            all_documents = []

            for folder in user_folders:
                folder_id = folder['id']
                folder_name = folder['name']  # Assuming this is the username

                # Retrieve the user by folder name (username)
                user = get_user_model().objects.filter(username=folder_name).first()
                if not user:
                    # If no matching user is found, skip this folder
                    continue

                # List files in each user's folder
                user_files = list_files_in_folder(service, folder_id)

                # Add user folder details to the response
                all_documents.append({
                    'user': {
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'email': user.email,
                        'folder_name': folder_name
                    },
                    'files': [
                        {
                            'file_id': file['id'],
                            'file_name': file['name'],
                            'file_type': file['mimeType'],
                            'file_url': file['webViewLink']
                        }
                        for file in user_files
                    ]
                })

            return Response({'documents': all_documents})

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

def list_files_in_folder(service, folder_id):
    """
    List all files in a specific folder in Google Drive.

    Args:
        service: Google Drive service instance.
        folder_id: ID of the folder to list files from.

    Returns:
        List of file metadata dictionaries.
    """
    try:
        query = f"'{folder_id}' in parents and trashed = false"
        results = service.files().list(
            q=query,
            fields="files(id, name, mimeType, webViewLink)"
        ).execute()
        return results.get('files', [])
    except HttpError as e:
        raise Exception(f"Error fetching files from folder: {str(e)}")


class FolderDocumentsView(APIView):
    """
    API to fetch all documents from a specific Google Drive folder.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Fixed folder ID for the Google Drive folder
            folder_id = "1C86ece0khaipNvwOObBNbLDvlKbVvfhI"

            # Initialize Google Drive service
            service = get_drive_service()

            # Fetch files from the specified folder
            files = list_files_in_folder(service, folder_id)

            # Prepare response data
            file_data = [
                {
                    'file_id': file['id'],
                    'file_name': file['name'],
                    'file_type': file['mimeType'],
                    'file_url': file['webViewLink']
                }
                for file in files
            ]

            return Response({'documents': file_data})

        except Exception as e:
            return Response({'error': str(e)}, status=500)
        
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Fetch user from request
            user = request.user

            # Fetch the additional user details
            try:
                user_details = UserDetails.objects.get(user=user)
            except UserDetails.DoesNotExist:
                return Response({'error': 'User details not found.'}, status=404)

            # Prepare the response data
            user_data = {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "personal_email": user_details.personal_email,
                "date_of_birth": user_details.date_of_birth,
                "blood_group": user_details.blood_group,
                "current_address": user_details.current_address,
                "permanent_address": user_details.permanent_address,
                "employee_id": user_details.employee_id,
                "reporting_manager": user_details.reporting_manager.first_name
                if user_details.reporting_manager else None,
                "position": user_details.position,
                "job_profile": user_details.job_profile,
                "employee_type": user_details.employee_type,
                "time_type": user_details.time_type,
                "location": user_details.location,
                "hire_date": user_details.hire_date,
                "length_of_service": user_details.length_of_service,
                "mobile_number": user_details.mobile_number,
                "emergency_contact_person": user_details.emergency_contact_person,
                "emergency_contact_number": user_details.emergency_contact_number,
                "gender": user_details.gender,
                "country_of_birth": user_details.country_of_birth,
                "marital_status": user_details.marital_status,
                "bank_account_name": user_details.bank_account_name,
                "bank_account_number": user_details.bank_account_number,
                "bank_account_ifsc_code": user_details.bank_account_ifsc_code,
                "pf_uan_no": user_details.pf_uan_no,
                "pf_no": user_details.pf_no,
                "pan_no": user_details.pan_no,
                "aadhar_number": user_details.aadhar_number,
            }

            return Response({"user_profile": user_data}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        


class UpdateUserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user  # Get the authenticated user
        user_details = user.details  # Access related UserDetails

        # List of updatable fields
        updatable_fields = [
            "personal_email",
            "blood_group",
            "current_address",
            "permanent_address",
            "mobile_number",
            "emergency_contact_person",
            "emergency_contact_number",
            "gender",
            "country_of_birth",
            "marital_status",
            "bank_account_name",
            "bank_account_number",
            "bank_account_ifsc_code",
            "pf_uan_no",
            "pf_no",
            "pan_no",
            "aadhar_number",
            "date_of_birth"
        ]

        changes_made = False

        # Update only fields provided in the request
        for field in updatable_fields:
            new_value = request.data.get(field)
            if new_value is not None:  # Check if the field is included in the request
                current_value = getattr(user_details, field, None)
                if current_value != new_value:  # Update only if the value has changed
                    setattr(user_details, field, new_value)
                    changes_made = True

        if changes_made:
            user_details.save()  # Save changes
            return Response({"message": "User details updated successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "No changes detected."}, status=status.HTTP_400_BAD_REQUEST)
        

class AllUserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if the logged-in user is an admin
        if not request.user.is_staff:
            return Response(
                {"error": "You do not have permission to access this resource."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Get all users
            users = get_user_model().objects.all()

            # Initialize the response data structure
            all_user_details = []

            for user in users:
                # Get the related UserDetails for each user
                user_details = UserDetails.objects.filter(user=user).first()

                if not user_details:
                    continue

                # Add user and user_details to the response
                all_user_details.append({
                    'user': {
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'username': user.username,
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser,
                    },
                    'details': {
                        'employee_id': user_details.employee_id,
                        'personal_email': user_details.personal_email,
                        'blood_group': user_details.blood_group,
                        'current_address': user_details.current_address,
                        'permanent_address': user_details.permanent_address,
                        'position': user_details.position,
                        'job_profile': user_details.job_profile,
                        'employee_type': user_details.employee_type,
                        'time_type': user_details.time_type,
                        'location': user_details.location,
                        'hire_date': user_details.hire_date,
                        'length_of_service': user_details.length_of_service,
                        'date_of_birth': user_details.date_of_birth,
                        'mobile_number': user_details.mobile_number,
                        'emergency_contact_person': user_details.emergency_contact_person,
                        'emergency_contact_number': user_details.emergency_contact_number,
                        'gender': user_details.gender,
                        'country_of_birth': user_details.country_of_birth,
                        'marital_status': user_details.marital_status,
                        'bank_account_name': user_details.bank_account_name,
                        'bank_account_number': user_details.bank_account_number,
                        'bank_account_ifsc_code': user_details.bank_account_ifsc_code,
                        'pf_uan_no': user_details.pf_uan_no,
                        'pf_no': user_details.pf_no,
                        'pan_no': user_details.pan_no,
                        'aadhar_number': user_details.aadhar_number,
                        'reporting_manager': user_details.reporting_manager.first_name + " " + user_details.reporting_manager.last_name
                                                if user_details.reporting_manager else None,
                    }
                })

            return Response({'user_details': all_user_details}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)