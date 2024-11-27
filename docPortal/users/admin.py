from django.contrib import admin
from .models import User, UserDetails, PublicHoliday
# Register your models here.

admin.site.register(User)
admin.site.register(UserDetails)

@admin.register(PublicHoliday)
class PublicHolidayAdmin(admin.ModelAdmin):
    list_display = ("name", "date", "comment")  # Show the comment in the list view
    search_fields = ("name", "comment")  # Allow searching by name and comment
    list_filter = ("date",)