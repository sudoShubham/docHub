from django.contrib import admin
from .models import User, UserDetails, PublicHoliday, LeaveBalance, LeaveRequest, Project, Timesheet
# Register your models here.

admin.site.register(User)
admin.site.register(UserDetails)

@admin.register(PublicHoliday)
class PublicHolidayAdmin(admin.ModelAdmin):
    list_display = ("name", "date", "comment")  # Show the comment in the list view
    search_fields = ("name", "comment")  # Allow searching by name and comment
    list_filter = ("date",)

# Admin for LeaveBalance
@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ("user", "total_leaves", "used_leaves", "remaining_leaves")
    search_fields = ("user__email",)
    readonly_fields = ("total_leaves", "used_leaves", "remaining_leaves")
    list_filter = ("user__is_active",)


# Admin for LeaveRequest
@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ("user", "start_date", "end_date", "status", "applied_on")
    search_fields = ("user__email", "reason")
    list_filter = ("status", "user__is_active")
    readonly_fields = ("applied_on", "approved_by", "manager_comment")
    actions = ["approve_leaves", "reject_leaves"]

    # Custom action to approve selected leave requests
    def approve_leaves(self, request, queryset):
        queryset.update(status="Approved")
        # Here, you could also add logic to deduct leave from the balance, if required

    # Custom action to reject selected leave requests
    def reject_leaves(self, request, queryset):
        queryset.update(status="Rejected")

    approve_leaves.short_description = "Approve selected leave requests"
    reject_leaves.short_description = "Reject selected leave requests"


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('project_name', 'project_code', 'get_users', 'delivery_manager', 'billing_rate', 'start_date', 'end_date')
    search_fields = ('project_name', 'project_code', 'delivery_manager__email')
    list_filter = ('start_date', 'end_date', 'delivery_manager')
    ordering = ('project_name',)
    filter_horizontal = ('users',)

    def get_users(self, obj):
        """
        Custom method to display users associated with the project.
        """
        return ", ".join([user.email for user in obj.users.all()])

    get_users.short_description = 'Assigned Users'  # Column header in the admin

@admin.register(Timesheet)
class TimesheetAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'date', 'hours_spent', 'is_approved', 'approved_by', 'approved_on')
    search_fields = ('user__email', 'project__project_name')
    list_filter = ('is_approved', 'project', 'date')
    actions = ['approve_timesheets']

    def approve_timesheets(self, request, queryset):
        """
        Custom admin action to approve selected timesheets.
        """
        for timesheet in queryset:
            if timesheet.is_approved:
                self.message_user(request, f"Timesheet for {timesheet} is already approved.")
                continue
            try:
                timesheet.approve(request.user)
                self.message_user(request, f"Approved timesheet for {timesheet}.")
            except ValueError as e:
                self.message_user(request, str(e), level="error")

    approve_timesheets.short_description = "Approve selected timesheets"