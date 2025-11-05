from django.db import models
from issues.models import issues ,OVERDUE_DAYS_LIMIT
from django.utils import timezone
from datetime import timedelta

# Create your models here.
class Students(models.Model):
    BORROW_LIMIT = 5
    student_id = models.CharField()
    name = models.CharField(null=True , blank=True)
    email = models.EmailField(null=True, blank=True)

    def __str__(self):
        return self.name if self.name else "Unnamed Student"
    def has_overdue_books(self):
        if issues.objects.filter(student=self, return_date__isnull=True , time__lt=timezone.now() - timedelta(days=OVERDUE_DAYS_LIMIT) ).exists() :
            return True
        return False
    def currently_borrowed_count(self):
        return issues.objects.filter(student=self, return_date__isnull=True).count()
    
    def fines_due(self):
        return 0
    