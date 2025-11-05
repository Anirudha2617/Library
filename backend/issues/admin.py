from django.contrib import admin
from django.utils import timezone
from datetime import timedelta
from .models import issues , OVERDUE_DAYS_LIMIT


class OverdueFilter(admin.SimpleListFilter):
    """Custom filter to show overdue books (issued >OVERDUE_DAYS_LIMIT days ago and not returned)."""
    title = "Overdue status"
    parameter_name = "overdue"

    def lookups(self, request, model_admin):
        return (
            ("overdue", f"Overdue ({OVERDUE_DAYS_LIMIT}+ days)"),
            ("not_overdue", "Not overdue"),
        )

    def queryset(self, request, queryset):
        today = timezone.now().date()
        fourteen_days_ago = today - timedelta(days=OVERDUE_DAYS_LIMIT)

        if self.value() == "overdue":
            return queryset.filter(return_date__isnull=True, time__date__lt=fourteen_days_ago)
        elif self.value() == "not_overdue":
            return queryset.exclude(return_date__isnull=True, time__date__lt=fourteen_days_ago)
        return queryset


@admin.register(issues)
class IssuesAdmin(admin.ModelAdmin):
    list_display = (
        "book_name",
        "student_id",
        "time",
        "student_name",
        "issue_date",
        "return_date",
        "is_overdue",
    )
    # list_editable = ("time",)
    list_filter = ("return_date", OverdueFilter)
    search_fields = (
        "book__title",
        "book__book_no",
        "student__student_id",
        "student__student_name",
    )
    ordering = ("-time",)

    @admin.display(description="Book Name")
    def book_name(self, obj):
        return obj.book.title if obj.book else "-"

    @admin.display(description="Student ID")
    def student_id(self, obj):
        return obj.student.student_id if obj.student else "-"

    @admin.display(description="Student Name")
    def student_name(self, obj):
        return obj.student.name if obj.student else "-"

    @admin.display(description="Issue Date")
    def issue_date(self, obj):
        return obj.time.strftime("%Y-%m-%d %H:%M")

    @admin.display(description="Overdue", boolean=True)
    def is_overdue(self, obj):
        if obj.return_date:
            return False
        return (timezone.now().date() - obj.time.date()).days > OVERDUE_DAYS_LIMIT
