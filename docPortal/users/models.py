from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone


# Custom UserManager
class UserManager(BaseUserManager):
    def normalize_email(self, email):
        """
        Normalize the email address by converting it to lowercase.
        """
        return email.lower()

    def create_user(self, email, username, first_name, last_name, password=None, **extra_fields):
        """
        Create and return a regular user with an email, username, and password.
        """
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, first_name=first_name, last_name=last_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, first_name, last_name, password=None, **extra_fields):
        """
        Create and return a superuser with an email, username, and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, username, first_name, last_name, password, **extra_fields)

# Custom User model
class User(AbstractUser):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)

    objects = UserManager()  # Use the custom UserManager

    USERNAME_FIELD = 'email'  # The email will be used as the username
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']  # Fields required for creating a superuser

    def __str__(self):
        return self.email  # Return the email as the string representation of the user
    

class UserDetails(models.Model):
    EMPLOYEE_TYPE_CHOICES = [
        ("Permanent", "Permanent"),
        ("Contract", "Contract"),
    ]
    TIME_TYPE_CHOICES = [
        ("Full-Time", "Full-Time"),
        ("Part-Time", "Part-Time"),
    ]
    MARITAL_STATUS_CHOICES = [
        ("Single", "Single"),
        ("Married", "Married"),
    ]
    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="details")
    personal_email = models.EmailField(null=True, blank=True)
    blood_group = models.CharField(max_length=4, null=True, blank=True)
    current_address = models.CharField(max_length=255, null=True, blank=True)
    permanent_address = models.CharField(max_length=255, null=True, blank=True)
    employee_id = models.CharField(max_length=10, unique=True, editable=False)
    reporting_manager = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="employees", null=True, blank=True)
    position = models.CharField(max_length=100, null=True, blank=True)
    job_profile = models.CharField(max_length=100, null=True, blank=True)
    employee_type = models.CharField(max_length=10, choices=EMPLOYEE_TYPE_CHOICES, null=True, blank=True)
    time_type = models.CharField(max_length=10, choices=TIME_TYPE_CHOICES, null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    length_of_service = models.CharField(max_length=50, null=True, blank=True, editable=False)
    date_of_birth = models.DateField(null=True, blank=True)
    mobile_number = models.CharField(max_length=15, null=True, blank=True)
    emergency_contact_person = models.CharField(max_length=100, null=True, blank=True)
    emergency_contact_number = models.CharField(max_length=15, null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    country_of_birth = models.CharField(max_length=100, null=True, blank=True)
    marital_status = models.CharField(max_length=10, choices=MARITAL_STATUS_CHOICES, null=True, blank=True)

    # Bank and ID details
    bank_account_name = models.CharField(max_length=100, null=True, blank=True)
    bank_account_number = models.CharField(max_length=20, null=True, blank=True)
    bank_account_ifsc_code = models.CharField(max_length=11, null=True, blank=True)
    pf_uan_no = models.CharField(max_length=20, null=True, blank=True)
    pf_no = models.CharField(max_length=20, null=True, blank=True)
    pan_no = models.CharField(max_length=10, null=True, blank=True)
    aadhar_number = models.CharField(max_length=12, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Generate employee_id if not already set
        if not self.employee_id:
            last_employee = UserDetails.objects.all().order_by("-id").first()
            last_id = int(last_employee.employee_id[2:]) if last_employee else 0
            self.employee_id = f"WN{last_id + 1:03d}"
        
        # Auto-generate length_of_service if hire_date is present
        if self.hire_date:
            today = date.today()
            years = today.year - self.hire_date.year
            months = today.month - self.hire_date.month
            days = today.day - self.hire_date.day

            if days < 0:
                months -= 1
                days += 30  # Approximation for days in a month
            if months < 0:
                years -= 1
                months += 12

            self.length_of_service = f"{years} years, {months} months, {days} days"
        else:
            self.length_of_service = "N/A"
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.employee_id}"



@receiver(post_save, sender=User)
def create_user_details(sender, instance, created, **kwargs):
    """
    Signal to create UserDetails entry whenever a new User is created.
    If the UserDetails already exists, skip creation.
    """
    if created and not hasattr(instance, 'details'):
        UserDetails.objects.create(user=instance)


#Holidays Table
class PublicHoliday(models.Model):
    date = models.DateField(unique=True)  # Ensure each holiday date is unique
    name = models.CharField(max_length=100)  # Holiday name
    comment = models.TextField(null=True, blank=True)  # Optional comments about the holiday

    class Meta:
        verbose_name = "Public Holiday"
        verbose_name_plural = "Public Holidays"
        ordering = ["date"]  # Orders holidays by date

    def __str__(self):
        return f"{self.name} ({self.date})"
    

# User = get_user_model()

# Model to track leave balance for each user
class LeaveBalance(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    total_leaves = models.IntegerField(default=20)
    used_leaves = models.IntegerField(default=0)
    
    @property
    def remaining_leaves(self):
        return self.total_leaves - self.used_leaves

    def update_remaining_leaves(self, leave_days_requested):
        # Ensure that we don’t go negative
        if self.used_leaves + leave_days_requested <= self.total_leaves:
            self.used_leaves += leave_days_requested
            self.save()
        else:
            raise ValueError("Insufficient leave balance")


# Model to handle leave requests
class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
        ("Cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="leave_requests")
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="Pending")
    applied_on = models.DateField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_leaves")
    manager_comment = models.TextField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Validate that leave dates don't overlap with public holidays
        holidays = PublicHoliday.objects.filter(date__range=(self.start_date, self.end_date))
        if holidays.exists():
            raise ValueError("Leave cannot overlap with public holidays.")

        # Ensure the requested leave doesn't exceed the remaining balance
        leave_days = (self.end_date - self.start_date).days + 1
        leave_balance = LeaveBalance.objects.get(user=self.user)

        if self.status == "Approved" and leave_days > leave_balance.remaining_leaves:
            raise ValueError("Insufficient leave balance.")

        # # Deduct leave days from balance if approved
        # if self.status == "Approved":
        #     leave_balance.update_remaining_leaves(leave_days)  # Updates used_leaves

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.status} ({self.start_date} to {self.end_date})"


# Signal to initialize leave balance for new users
from django.db.models.signals import post_save

def initialize_leave_balance(sender, instance, created, **kwargs):
    if created and not hasattr(instance, "leave_balance"):
        LeaveBalance.objects.create(user=instance)

post_save.connect(initialize_leave_balance, sender=User)


class Project(models.Model):
    users = models.ManyToManyField(User, related_name="projects", blank=True)
    project_name = models.CharField(max_length=255)
    project_code = models.CharField(max_length=50, unique=True)  # Unique project identifier
    billing_rate = models.DecimalField(max_digits=10, decimal_places=2)  # Billing rate per hour
    delivery_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="managed_projects")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['project_name']
    
    def __str__(self):
        return f"{self.project_name} ({self.project_code})"
    
    
class Timesheet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="timesheets")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="timesheets")
    date = models.DateField()
    hours_spent = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.TextField(null=True, blank=True)
    is_approved = models.BooleanField(default=False)  # Indicates if the timesheet is approved
    approved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_timesheets"
    )  # Delivery manager who approved the timesheet
    approved_on = models.DateTimeField(null=True, blank=True)  # Timestamp of approval
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', 'project', 'user']

    def approve(self, manager):
        """
        Approve the timesheet by a delivery manager.
        """
        if manager != self.project.delivery_manager:
            raise ValueError("Only the assigned delivery manager can approve this timesheet.")
        
        self.is_approved = True
        self.approved_by = manager
        self.approved_on = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.user.email} - {self.project.project_name} ({self.date})"