from rest_framework import serializers
from .models import Books, Publisher
from issues.models import issues 
from students.models import Students

# class PublisherSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Publisher
#         fields = ["id", "name", "address", "contact"]



class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = ['id', 'name']  # adjust fields as needed

class BooksSerializer(serializers.ModelSerializer):
    # Nested publisher read-only
    publisher = PublisherSerializer(read_only=True)

    # To assign publisher when creating/updating
    publisher_id = serializers.PrimaryKeyRelatedField(
        queryset=Publisher.objects.all(),
        source='publisher',
        write_only=True
    )
    isbn = serializers.SerializerMethodField(None)
    total_quantity = serializers.IntegerField(source='quantity')
    available_quantity = serializers.SerializerMethodField(None)
    # Borrowed_by field can be null
    borrowed_by = serializers.SerializerMethodField(None)

    class Meta:
        model = Books
        fields = [
            "id",
            "book_no",
            "title",
            "isbn",
            "total_quantity",
            "available_quantity",
            "borrowed_by",
            "author",
            "publisher",
            "publisher_id",
            "vol",
            "published_year",
            "bill_no",
            "price",
            "catelog_no",
            "remarks",
        ]
    def get_isbn(self , obj):
        return None
    
    def get_available_quantity(self , obj):
        issued_books = issues.objects.filter(return_date__isnull=True,book = obj).count()
        left_quantity = obj.quantity - issued_books
        print("Available quantity for book id", obj.id, "is", left_quantity)
        return left_quantity
    
    def get_borrowed_by(self , obj):
        active_issues = issues.objects.filter(return_date__isnull=True, book=obj)
        return IssueSerializer(active_issues, many=True).data
    

class IssueSerializer(serializers.ModelSerializer):
    student_id = serializers.SerializerMethodField()
    student_name = serializers.CharField(source='student.name')
    borrow_date = serializers.DateTimeField(source='time')

    class Meta:
        model = issues
        fields = ["student_id", "student_name", "borrow_date", "return_date"]

    def get_student_id(self , obj):
        student = Students.objects.get(id=obj.student.id)
        return student.student_id

class BookHistory(serializers.ModelSerializer):

    issues = serializers.SerializerMethodField()
    book_id = serializers.IntegerField(source='id')
    class Meta:
        model = Books
        fields = ["book_id","title", "issues"]

    def get_issues(self , obj):
        issue_qs = issues.objects.filter(book=obj)
        return IssueSerializer(issue_qs, many=True).data


class BorrowSerializer(serializers.ModelSerializer):

    isbn = serializers.SerializerMethodField(None)
    total_quantity = serializers.IntegerField(source='quantity')
    available_quantity = serializers.SerializerMethodField(None)
    # Borrowed_by field can be null
    borrowed_by = serializers.SerializerMethodField()

    class Meta:
        model = Books
        fields = [
            "id",
            "title",
            "author",
            "isbn",
            "total_quantity",
            "available_quantity",
            "borrowed_by",


        ]
    def get_isbn(self , obj):
        return None
    
    def get_available_quantity(self , obj):
        issued_books = issues.objects.filter(return_date__isnull=True,book = obj).count()
        left_quantity = obj.quantity - issued_books
        return left_quantity
    
    def get_borrowed_by(self , obj):
        issue_qs = issues.objects.filter(return_date__isnull=True,book=obj)
        return IssueSerializer(issue_qs, many=True).data
    
