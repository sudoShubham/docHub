from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated
from googleapiclient.errors import HttpError
from .google_drive_service import get_drive_service, get_or_create_folder, upload_file_with_versioning, share_folder_with_email, list_files_in_folder
from datetime import datetime
from rest_framework import status
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, PublicHolidaySerializer, LeaveRequestSerializer, ProjectSerializer, TimesheetSerializer
from .models import User, UserDetails, PublicHoliday, LeaveBalance, LeaveRequest, Project, Timesheet
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.exceptions import ValidationError
from rest_framework.exceptions import NotFound
from reportlab.lib.pagesizes import letter
import json
from io import BytesIO
from django.http import JsonResponse, HttpResponse
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from django.template.loader import get_template
from django.shortcuts import render




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
                "reporting_manager": user_details.reporting_manager.first_name + " "+ user_details.reporting_manager.last_name
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



class UpdateUserDetailsViewSelf(APIView):
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
        


class UpdateUserDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        # Check if the user is staff
        if not request.user.is_staff:
            return Response({"error": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        user_email = data.get("email")
        details_data = data.get("details")

        # Get user by email
        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Update UserDetails fields
        user_details = user.details

        # Handle reporting_manager
        if 'reporting_manager' in details_data and details_data['reporting_manager']:
            try:
                reporting_manager = User.objects.get(email=details_data['reporting_manager'])
                user_details.reporting_manager = reporting_manager
            except User.DoesNotExist:
                return Response({"error": f"Reporting manager with email '{details_data['reporting_manager']}' not found."},
                                 status=status.HTTP_404_NOT_FOUND)

        # Handle hire_date
        if 'hire_date' in details_data and details_data['hire_date']:
            try:
                hire_date = datetime.strptime(details_data['hire_date'], "%Y-%m-%d").date()
                user_details.hire_date = hire_date
            except ValueError:
                return Response({"error": "Invalid date format. Please use YYYY-MM-DD."},
                                 status=status.HTTP_400_BAD_REQUEST)


        #handle first name and last name
        if 'first_name' in details_data:
            user.first_name = details_data['first_name']

        if 'last_name' in details_data:
            user.last_name = details_data['last_name']

        # Handle other fields
        if 'personal_email' in details_data:
            user_details.personal_email = details_data['personal_email']
        if 'blood_group' in details_data:
            user_details.blood_group = details_data['blood_group']
        if 'current_address' in details_data:
            user_details.current_address = details_data['current_address']
        if 'permanent_address' in details_data:
            user_details.permanent_address = details_data['permanent_address']
        if 'position' in details_data:
            user_details.position = details_data['position']
        if 'job_profile' in details_data:
            user_details.job_profile = details_data['job_profile']
        if 'employee_type' in details_data:
            user_details.employee_type = details_data['employee_type']
        if 'time_type' in details_data:
            user_details.time_type = details_data['time_type']
        if 'location' in details_data:
            user_details.location = details_data['location']
        if 'length_of_service' in details_data:
            user_details.length_of_service = details_data['length_of_service']
        if 'date_of_birth' in details_data:
            user_details.date_of_birth = details_data['date_of_birth']
        if 'mobile_number' in details_data:
            user_details.mobile_number = details_data['mobile_number']
        if 'emergency_contact_person' in details_data:
            user_details.emergency_contact_person = details_data['emergency_contact_person']
        if 'emergency_contact_number' in details_data:
            user_details.emergency_contact_number = details_data['emergency_contact_number']
        if 'gender' in details_data:
            user_details.gender = details_data['gender']
        if 'country_of_birth' in details_data:
            user_details.country_of_birth = details_data['country_of_birth']
        if 'marital_status' in details_data:
            user_details.marital_status = details_data['marital_status']

        # Bank and ID details
        if 'bank_account_name' in details_data:
            user_details.bank_account_name = details_data['bank_account_name']
        if 'bank_account_number' in details_data:
            user_details.bank_account_number = details_data['bank_account_number']
        if 'bank_account_ifsc_code' in details_data:
            user_details.bank_account_ifsc_code = details_data['bank_account_ifsc_code']
        if 'pf_account_number' in details_data:
            user_details.pf_uan_no = details_data['pf_account_number']
        if 'pf_no' in details_data:
            user_details.pf_no = details_data['pf_no']
        if 'pan_no' in details_data:
            user_details.pan_no = details_data['pan_no']
        if 'aadhar_number' in details_data:
            user_details.aadhar_number = details_data['aadhar_number']

        user_details.save()
        user.save()

        return Response({"success": "User and details updated successfully."}, status=status.HTTP_200_OK)
    

class ReportingHierarchyView(APIView):
    permission_classes = [IsAuthenticated]

    def get_hierarchy_upwards(self, user, visited=None):
        """
        Recursively fetch the hierarchy upwards (reporting managers) with a detailed response, including employee_id.
        """
        if visited is None:
            visited = set()

        if user in visited:
            return []  # Stop recursion for cycles

        visited.add(user)

        hierarchy = []
        user_details = UserDetails.objects.filter(user=user).select_related('reporting_manager').first()
        if user_details and user_details.reporting_manager:
            manager = user_details.reporting_manager
            manager_details = UserDetails.objects.filter(user=manager).first()
            hierarchy.append({
                "employee_id": manager_details.employee_id if manager_details else None,
                "name": manager.get_full_name(),
                "email": manager.email,
                "position": manager_details.position if manager_details else None,
                "reports": self.get_hierarchy_upwards(manager, visited)  # Recursive call
            })
        return hierarchy
           

    def get_hierarchy_downwards(self, user, visited=None):
        """
        Recursively fetch the hierarchy downwards (direct and indirect reports), avoiding cycles.
        """
        if visited is None:
            visited = set()

        if user in visited:
            return []  # Stop recursion for cycles

        visited.add(user)

        reports = UserDetails.objects.filter(reporting_manager=user).select_related('user')
        hierarchy = []
        for report in reports:
            hierarchy.append({
                "employee_id": report.employee_id,
                "name": report.user.get_full_name(),
                "email": report.user.email,
                "position": report.position,
                "reports": self.get_hierarchy_downwards(report.user, visited),  # Recursive call with visited set
            })
        return hierarchy    


    def get(self, request, *args, **kwargs):
        user = request.user

        # Fetch the upward hierarchy
        upward_hierarchy = self.get_hierarchy_upwards(user)

        # Fetch the downward hierarchy
        downward_hierarchy = self.get_hierarchy_downwards(user)

        return Response({
            "upward_hierarchy": upward_hierarchy,
            "downward_hierarchy": downward_hierarchy,
        })
    
class PublicHolidayView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Retrieve all public holidays or a specific holiday if 'pk' is provided.
        """
        pk = kwargs.get('pk')
        if pk:
            try:
                holiday = PublicHoliday.objects.get(pk=pk)
                serializer = PublicHolidaySerializer(holiday)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except PublicHoliday.DoesNotExist:
                return Response({"error": "Holiday not found."}, status=status.HTTP_404_NOT_FOUND)

        holidays = PublicHoliday.objects.all().order_by("date")
        serializer = PublicHolidaySerializer(holidays, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """
        Add a new public holiday. Only accessible to staff users.
        """
        if not request.user.is_staff:
            return Response(
                {"error": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = PublicHolidaySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        """
        Update a public holiday. Only accessible to staff users.
        """
        if not request.user.is_staff:
            return Response(
                {"error": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )

        pk = kwargs.get('pk')
        if not pk:
            return Response({"error": "Holiday ID is required for update."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            holiday = PublicHoliday.objects.get(pk=pk)
        except PublicHoliday.DoesNotExist:
            return Response({"error": "Holiday not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PublicHolidaySerializer(holiday, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        """
        Delete a public holiday. Only accessible to staff users.
        """
        if not request.user.is_staff:
            return Response(
                {"error": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )

        pk = kwargs.get('pk')
        if not pk:
            return Response({"error": "Holiday ID is required for deletion."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            holiday = PublicHoliday.objects.get(pk=pk)
            holiday.delete()
            return Response({"message": "Holiday deleted successfully."}, status=status.HTTP_200_OK)
        except PublicHoliday.DoesNotExist:
            return Response({"error": "Holiday not found."}, status=status.HTTP_404_NOT_FOUND)
        


class GetLeaveDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # Get the authenticated user

        try:
            # Get leave balance for the user
            leave_balance = LeaveBalance.objects.get(user=user)

            # Get the leave requests waiting for approval
            pending_leaves = LeaveRequest.objects.filter(
                user=user, status="Pending"
            )

            # Get the leave history (approved or rejected)
            leave_history = LeaveRequest.objects.filter(
                Q(user=user) & ~Q(status="Pending")
            ).order_by('-applied_on')

            # Prepare the response data
            leave_details = {
                "total_leaves": leave_balance.total_leaves,
                "used_leaves": leave_balance.used_leaves,
                "remaining_leaves": leave_balance.remaining_leaves,
                "pending_leaves": [
                    {
                        "leave_id": leave.id,
                        "start_date": leave.start_date,
                        "end_date": leave.end_date,
                        "reason": leave.reason,
                        "applied_on": leave.applied_on,
                    }
                    for leave in pending_leaves
                ],
                "leave_history": [
                    {
                        "leave_id": leave.id,
                        "start_date": leave.start_date,
                        "end_date": leave.end_date,
                        "reason": leave.reason,
                        "status": leave.status,
                        "approved_by": leave.approved_by.email if leave.approved_by else None,
                        "applied_on": leave.applied_on,
                    }
                    for leave in leave_history
                ],
            }

            return Response(leave_details, status=status.HTTP_200_OK)

        except LeaveBalance.DoesNotExist:
            return Response(
                {"detail": "Leave balance not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    
class ApplyLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user  # Get the authenticated user

        # Get the leave details from the request
        start_date_str = request.data.get("start_date")
        end_date_str = request.data.get("end_date")
        reason = request.data.get("reason")

        # Validate the inputs
        if not start_date_str or not end_date_str or not reason:
            return Response(
                {"detail": "Start date, end date, and reason are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Convert the date strings to datetime objects, then strip the time part
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

            # Get the leave balance for the user
            leave_balance = LeaveBalance.objects.get(user=user)

            # Calculate the number of days of leave requested
            leave_days_requested = (end_date - start_date).days + 1

            # Check if the user has enough remaining leaves
            if leave_balance.remaining_leaves < leave_days_requested:
                return Response(
                    {"detail": "Insufficient leave balance."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create the leave request object
            leave_request = LeaveRequest.objects.create(
                user=user,
                start_date=start_date,
                end_date=end_date,
                reason=reason,
                status="Pending",  # Initially, the leave request is pending approval
            )

            # Update the leave balance (deduct the used leave)
            leave_balance.used_leaves += leave_days_requested
            leave_balance.save()

            # Return the response with the leave request details
            return Response(
                {
                    "detail": "Leave applied successfully.",
                    "leave_request": LeaveRequestSerializer(leave_request).data,
                },
                status=status.HTTP_201_CREATED,
            )

        except LeaveBalance.DoesNotExist:
            return Response(
                {"detail": "Leave balance not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class UserReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the logged-in user
        user = request.user

        # Get all users reporting to the logged-in user
        reporting_users = UserDetails.objects.filter(reporting_manager=user)

        # Prepare the response data
        users_data = []
        for user_details in reporting_users:
            user_info = {
                "email": user_details.user.email,
                "first_name": user_details.user.first_name,
                "last_name": user_details.user.last_name,
                "employee_id": user_details.employee_id,
                "position": user_details.position,
                "leave_balance": {
                    "total_leaves": user_details.user.leavebalance.total_leaves,
                    "used_leaves": user_details.user.leavebalance.used_leaves,
                    "remaining_leaves": user_details.user.leavebalance.remaining_leaves,
                },
                "leave_requests": []
            }

            # Get leave requests for this user
            leave_requests = LeaveRequest.objects.filter(user=user_details.user)
            leave_data = []
            for leave_request in leave_requests:
                leave_data.append({
                    "leave_id":leave_request.id,
                    "start_date": leave_request.start_date,
                    "end_date": leave_request.end_date,
                    "status": leave_request.status,
                    "reason": leave_request.reason,
                    "applied_on": leave_request.applied_on,
                    "approved_by": leave_request.approved_by.email if leave_request.approved_by else None,
                    "manager_comment": leave_request.manager_comment
                })

            user_info["leave_requests"] = leave_data
            users_data.append(user_info)

        return Response(users_data, status=status.HTTP_200_OK)
    

class ApproveLeaveView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request, *args, **kwargs):
        leave_id = request.data.get("leave_id")
        manager_comment = request.data.get("manager_comment")

        if not leave_id or not manager_comment:
            return Response(
                {"detail": "Leave ID and manager comment are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Retrieve the leave request by ID
            leave_request = LeaveRequest.objects.get(id=leave_id)

            # Check if the logged-in user is the manager of the user requesting leave
            if leave_request.user.details.reporting_manager != request.user:
                return Response(
                    {"detail": "You are not authorized to approve this leave request."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Validate if the leave request is still pending
            if leave_request.status != "Pending":
                return Response(
                    {"detail": "Leave request is already processed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate leave days do not overlap with public holidays
            holidays = PublicHoliday.objects.filter(date__range=(leave_request.start_date, leave_request.end_date))
            if holidays.exists():
                return Response(
                    {"detail": "Leave cannot overlap with public holidays."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Ensure the leave request is within the available balance
            leave_days = (leave_request.end_date - leave_request.start_date).days + 1
            leave_balance = LeaveBalance.objects.get(user=leave_request.user)

            if leave_days > leave_balance.remaining_leaves:
                return Response(
                    {"detail": "Insufficient leave balance."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Approve the leave and update the leave balance
            leave_request.status = "Approved"
            leave_request.manager_comment = manager_comment
            leave_request.approved_by = request.user
            leave_request.save()

            # leave_balance.update_remaining_leaves(leave_days)  # Deduct the leaves from the balance

            return Response(
                {"detail": "Leave request approved successfully."},
                status=status.HTTP_200_OK,
            )

        except ObjectDoesNotExist:
            return Response(
                {"detail": "Leave request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class RejectLeaveView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request, *args, **kwargs):
        leave_id = request.data.get("leave_id")
        manager_comment = request.data.get("manager_comment")

        if not leave_id or not manager_comment:
            return Response(
                {"detail": "Leave ID and manager comment are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Retrieve the leave request by ID
            leave_request = get_object_or_404(LeaveRequest, id=leave_id)

            # Check if the logged-in user is the manager of the user requesting leave
            if leave_request.user.details.reporting_manager != request.user:
                return Response(
                    {"detail": "You are not authorized to reject this leave request."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Validate if the leave request is still pending
            if leave_request.status != "Pending":
                return Response(
                    {"detail": "Leave request is already processed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Reject the leave request and add the manager's comment
            leave_request.status = "Rejected"
            leave_request.manager_comment = manager_comment
            leave_request.rejected_by = request.user
            leave_request.save()

            # Credit the leave back to the user's balance
            leave_days = (leave_request.end_date - leave_request.start_date).days + 1
            try:
                leave_balance = LeaveBalance.objects.get(user=leave_request.user)
                leave_balance.used_leaves -= leave_days  # Decrease used_leaves to credit the leave back
                leave_balance.save()

                return Response(
                    {"detail": "Leave request rejected successfully, leave credited back to account."},
                    status=status.HTTP_200_OK,
                )
            except LeaveBalance.DoesNotExist:
                return Response(
                    {"error": "Leave balance not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        except ObjectDoesNotExist:
            return Response(
                {"detail": "Leave request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        


class CancelLeaveRequestView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request, leave_request_id):
        # Get the logged-in user
        user = request.user

        # Get the leave request by ID
        leave_request = get_object_or_404(LeaveRequest, id=leave_request_id)

        # Check if the leave request is in 'Pending' state
        if leave_request.status != "Pending":
            return Response({"error": "Leave request is not in 'Pending' state."}, status=400)

        # Check if the logged-in user is the one who applied for the leave, or if the user is staff
        if leave_request.user != user and not user.is_staff:
            return Response({"error": "You do not have permission to cancel this leave request."}, status=403)

        # Optionally, add back leave days to the user's balance
        leave_days = (leave_request.end_date - leave_request.start_date).days + 1
        try:
            leave_balance = LeaveBalance.objects.get(user=leave_request.user)
            leave_balance.used_leaves -= leave_days
            leave_balance.save()

            # Update the leave request status to "Cancelled"
            leave_request.status = "Cancelled"
            leave_request.save()

            return Response({"message": "Leave request has been successfully cancelled."}, status=200)

        except LeaveBalance.DoesNotExist:
            return Response({"error": "Leave balance not found."}, status=404)
        

class UserProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        """
        Fetch a specific project by ID for the logged-in user.
        """
        try:
            # Get the project by ID and check if the logged-in user is assigned to it
            project = Project.objects.get(id=id, users=request.user)
        except Project.DoesNotExist:
            raise NotFound("Project not found or you are not assigned to it.")
        
        # Serialize the project
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)


#Timesheet
class UserProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Fetch all projects assigned to the logged-in user.
        """
        user = request.user
        projects = Project.objects.filter(users=user)  # Get all projects where the user is assigned
        serializer = ProjectSerializer(projects, many=True)  # Serialize the projects
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class SubmitTimesheetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Extract data from the request body
        project_id = request.data.get("project")
        date = request.data.get("date")
        hours_spent = request.data.get("hours_spent")
        description = request.data.get("description")

        # Ensure all required fields are provided
        if not project_id or not date or not hours_spent:
            return Response({"error": "Project, date, and hours_spent are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate if the logged-in user is part of the project
        user = request.user
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Project not found."}, status=status.HTTP_400_BAD_REQUEST)

        if user not in project.users.all():
            return Response({"error": "You are not assigned to this project."}, status=status.HTTP_403_FORBIDDEN)

        # Create a new Timesheet entry
        timesheet = Timesheet(
            user=user,
            project=project,
            date=date,
            hours_spent=hours_spent,
            description=description
        )

        # Save the timesheet
        try:
            timesheet.save()
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Return the created timesheet details as the response
        return Response({
            "id": timesheet.id,
            "user": timesheet.user.username,
            "project": timesheet.project.project_name,
            "date": timesheet.date,
            "hours_spent": timesheet.hours_spent,
            "description": timesheet.description,
            "is_approved": timesheet.is_approved,
            "approved_by": timesheet.approved_by.id if timesheet.approved_by else None,
            "approved_on": timesheet.approved_on
        }, status=status.HTTP_201_CREATED)
    

class UpdateTimesheetView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        # Extract timesheet ID from URL
        timesheet_id = kwargs.get('timesheet_id')

        # Get the timesheet object
        try:
            timesheet = Timesheet.objects.get(id=timesheet_id)
        except ObjectDoesNotExist:
            return Response({"error": "Timesheet not found."}, status=status.HTTP_404_NOT_FOUND)

        # Ensure the logged-in user is the one who created the timesheet
        if timesheet.user != request.user:
            return Response({"error": "You can only update your own timesheet."}, status=status.HTTP_403_FORBIDDEN)

        # Check if the timesheet is already approved, and prevent modification of approved timesheets
        if timesheet.is_approved:
            return Response({"error": "Approved timesheets cannot be updated."}, status=status.HTTP_400_BAD_REQUEST)

        # Extract the data from the request
        hours_spent = request.data.get("hours_spent")
        description = request.data.get("description")

        # Update the fields if provided
        if hours_spent is not None:
            timesheet.hours_spent = hours_spent
        if description is not None:
            timesheet.description = description

        # Save the updated timesheet
        timesheet.save()

        # Return the updated timesheet data in the response
        response_data = {
            "id": timesheet.id,
            "user": timesheet.user.username,
            "user_name": timesheet.user.get_full_name(),
            "project": timesheet.project.id,
            "date": timesheet.date,
            "hours_spent": timesheet.hours_spent,
            "description": timesheet.description,
            "is_approved": timesheet.is_approved,
            "approved_by": timesheet.approved_by.username if timesheet.approved_by else None,
            "approved_on": timesheet.approved_on
        }

        return Response(response_data, status=status.HTTP_200_OK)
    
class TimesheetDetailsView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request, project_id, format=None):
        # Get the logged-in user
        user = request.user
        
        # Filter timesheets by both project_id and logged-in user
        timesheets = Timesheet.objects.filter(project_id=project_id, user=user).order_by('-date')

        if not timesheets.exists():
            return Response({"detail": "No timesheets found for this project and user."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the timesheet data
        serializer = TimesheetSerializer(timesheets, many=True)
        return Response(serializer.data)
 


class GenerateSalarySlipView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            # Extract the JSON payload
            data = request.data
            
            # Extract user details and other data from payload
            user_details = data.get('userDetails', {})
            ctc = data.get('ctc', 0)
            salary_date = data.get('salaryDate', '')
            salary_month = data.get('salaryMonth', '')
            earnings = data.get('earnings', [])
            deductions = data.get('deductions', [])
            net_salary = data.get('netSalary', 0)
            paidDays = data.get('paidDays','')

            # Calculate total earnings and total deductions
            total_earnings = sum([earning['amount'] for earning in earnings])
            total_deductions = sum([deduction['amount'] for deduction in deductions])

            # Render the HTML template with the provided context
            template = get_template('salary_slip.html')
        
            context = {
                'user_details': user_details,
                'earnings': earnings,
                'deductions': deductions,
                'net_salary': net_salary,
                'salary_date': salary_date,
                'salary_month': salary_month,
                'ctc': ctc,
                'total_earnings': total_earnings,
                'total_deductions': total_deductions,
                'paidDays': paidDays,
            }
            html = template.render(context)

            # Return HTML as the response
            return HttpResponse(html)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)