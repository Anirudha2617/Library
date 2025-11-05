from django.db import models
from django.utils import timezone

OVERDUE_DAYS_LIMIT = 10
# Create your models here.
class issues(models.Model):
    book = models.ForeignKey('books.Books' , on_delete=models.DO_NOTHING)
    student = models.ForeignKey('students.Students', on_delete=models.CASCADE)
    time = models.DateTimeField(default=timezone.now)
    return_date = models.DateField(null=True,blank=True)
    #issued by Teacher