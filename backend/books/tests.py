from django.test import TestCase
from books.serializers import BookHistory , BorrowSerializer
from books.models import Books
# Create your tests here.
book_id = 1 
book = Books.objects.get(id=book_id)
print("Book History:",BorrowSerializer(book).data)