from django.contrib import admin
from .models import User, UserDetails, PublicHoliday, LeaveBalance, LeaveRequest
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
