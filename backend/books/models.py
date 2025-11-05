from django.db import models
from issues.models import issues

class Publisher(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    contact = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name if self.name else "Unnamed Publisher"


class Books(models.Model):
    book_no = models.CharField(max_length=100, null=True, blank=True)
    title = models.CharField(max_length=255, null=True, blank=True)
    author = models.CharField(max_length=255, null=True, blank=True)
    date_of_issue = models.DateField(null=True, blank=True)
    quantity = models.IntegerField(null=True, blank=True)
    publisher = models.ForeignKey(
        Publisher, on_delete=models.SET_NULL, null=True, blank=True
    )
    vol = models.CharField(max_length=50, null=True, blank=True)
    published_year = models.DateField(null=True, blank=True)
    bill_no = models.CharField(max_length=100, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    catelog_no = models.CharField(max_length=100, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title if self.title else "Untitled Book"
    
    def available_copies(self):
        issued_count = issues.objects.filter(book=self, return_date__isnull=True).count()
        return self.quantity - issued_count
    

