from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BooksViewSet , book_issues 

router = DefaultRouter()
router.register(r'books', BooksViewSet, basename='books')

urlpatterns = [
    path('', include(router.urls)),
    path('books/<int:book_id>/history/', book_issues, name='book-history'),

]
 