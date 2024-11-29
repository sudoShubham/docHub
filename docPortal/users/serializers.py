from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import User, UserDetails, PublicHoliday, LeaveRequest, Project, Timesheet

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = get_user_model()
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        """
        Check that the password and confirm_password match.
        """
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords must match.")
        return data

    def create(self, validated_data):
        # Remove 'confirm_password' before passing to the model
        validated_data.pop('confirm_password', None)
        user = get_user_model().objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDetails
        fields = [
            'personal_email', 'blood_group', 'current_address', 'permanent_address',
            'employee_id', 'reporting_manager', 'position', 'job_profile', 'employee_type',
            'time_type', 'location', 'hire_date', 'length_of_service', 'date_of_birth', 
            'mobile_number', 'emergency_contact_person', 'emergency_contact_number', 'gender',
            'country_of_birth', 'marital_status', 'bank_account_name', 'bank_account_number',
            'bank_account_ifsc_code', 'pf_uan_no', 'pf_no', 'pan_no', 'aadhar_number'
        ]

class UserSerializer(serializers.ModelSerializer):
    details = UserDetailsSerializer(read_only=True)  # Include UserDetails as a nested serializer

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'details']  # Add 'details' field

class PublicHolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicHoliday
        fields = ['id', 'date', 'name', 'comment']
        

class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = ['id', 'start_date', 'end_date', 'reason', 'status', 'applied_on']


class ProjectSerializer(serializers.ModelSerializer):
    # Add a custom field to get the delivery manager's name
    delivery_manager_name = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'project_name', 'project_code', 'delivery_manager_name', 'start_date', 'end_date']

    def get_delivery_manager_name(self, obj):
        # Check if a delivery manager is assigned and return their name
        if obj.delivery_manager:
            return f"{obj.delivery_manager.first_name} {obj.delivery_manager.last_name}"
        return None  # If no delivery manager is assigned, return None
    

class TimesheetSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email')
    project_name = serializers.CharField(source='project.project_name')
    approved_by_email = serializers.CharField(source='approved_by.email', required=False)

    class Meta:
        model = Timesheet
        fields = [
            'id', 'user_email', 'project_name', 'date', 'hours_spent', 'description',
            'is_approved', 'approved_by_email', 'approved_on', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']