from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

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