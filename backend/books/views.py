from rest_framework import viewsets
from .models import Books
from .serializers import BooksSerializer, BookHistory, BorrowSerializer
from rest_framework.decorators import api_view , action
from rest_framework.response import Response
from rest_framework import status
from issues.models import issues


class BooksViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Books
    """
    queryset = Books.objects.all()
    serializer_class = BooksSerializer

    @action(detail=False, methods=['get'], url_path='borrowed')
    def get_borrowed(self , request):
        """
        Returns books that are currently borrowed (at least one copy issued).
        """
        # Books that have at least one active issue (not returned)
        borrowed_book_ids = (
            issues.objects
            .filter(return_date__isnull=True)
            .values_list('book_id', flat=True)
            .distinct()
        )

        borrowed_books = Books.objects.filter(id__in=borrowed_book_ids)

        serializer = BorrowSerializer(borrowed_books, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def book_issues(request, book_id):
    try:
        book = Books.objects.get(id=book_id)
    except Books.DoesNotExist:
        return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = BookHistory(book)
    return Response(serializer.data, status=status.HTTP_200_OK)


