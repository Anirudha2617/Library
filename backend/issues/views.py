from django.shortcuts import render
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status
from issues.models import issues , OVERDUE_DAYS_LIMIT
from books.models import Books
from students.models import Students

@api_view(['POST'])
def lend_book(request, student_id, book_id):
    print("Lend book request received for student_id:", student_id, "and book_id:", book_id)
    try:
        book = Books.objects.get(id=book_id)
        student = Students.objects.get(id=student_id)

        if book.available_copies() < 1:
            print("No copies available for book_id:", book_id)
            return Response({
                "success": False,
                "message": "No copies available",
                "student": {"student_id": str(student.id), "student_name": student.name},
                "book": {"book_id": book.id, "title": book.title}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        elif student.currently_borrowed_count() >= Students.BORROW_LIMIT:
            print("Student has reached borrow limit:", student_id)
            return Response({
                "success": False,
                "message": "Student has reached borrow limit",
                "student": {"student_id": str(student.id), "student_name": student.name},
                "book": {"book_id": book.id, "title": book.title}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        elif student.fines_due() > 0:
            print("Student has pending fines:", student_id)
            return Response({
                "success": False,
                "message": "Student has pending fines",
                "student": {"student_id": str(student.id), "student_name": student.name},
                "book": {"book_id": book.id, "title": book.title}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        elif issues.objects.filter(book=book, student=student, return_date__isnull=True).exists():
            print("Student has already borrowed this book:", student_id, book_id)
            return Response({
                "success": False,
                "message": "Student has already borrowed this book",
                "student": {"student_id": str(student.id), "student_name": student.name},
                "book": {"book_id": book.id, "title": book.title}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            print("Issuing book:", book_id, "to student:", student_id)
            issue = issues.objects.create(
                book=book,
                student=student
            )
            return Response({
                "success": True,
                "message": "Book issued successfully",
                "student": {"student_id": str(student.id), "student_name": student.name},
                "book": {"book_id": book.id, "title": book.title},
                "borrow_date": issue.time.isoformat(),
                "return_date": issue.return_date.isoformat() if issue.return_date else None
            }, status=status.HTTP_201_CREATED)
            
    except (Books.DoesNotExist, Students.DoesNotExist):
        print("Book or student not found:", student_id, book_id)
        return Response({
            "success": False,
            "message": "Book or student not found",
            "student": {"student_id": str(student_id), "student_name": None},
            "book": {"book_id": book_id, "title": None}
        }, status=status.HTTP_404_NOT_FOUND)

from django.utils import timezone

@api_view(['POST'])
def return_book(request, student_id, book_id):
    print("Return book request received for student_id:", student_id, "and book_id:", book_id)
    try:
        book = Books.objects.get(id=book_id)
        student = Students.objects.get(id=student_id)

        issue = issues.objects.filter(book=book, student=student, return_date__isnull=True).first()
        if not issue:
            print("No active issue found for student_id:", student_id, "and book_id:", book_id)
            return Response({
                "success": False,
                "message": "No active issue found for this book and student",
                "student": {"student_id": str(student.id), "student_name": student.name},
                "book": {"book_id": book.id, "title": book.title}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        issue.return_date = timezone.now()
        issue.save()
        print("Book returned successfully for student_id:", student_id, "and book_id:", book_id)
        return Response({
            "success": True,
            "message": "Book returned successfully",
            "student": {"student_id": str(student.id), "student_name": student.name},
            "book": {"book_id": book.id, "title": book.title},
            "return_date": issue.return_date.isoformat()
        }, status=status.HTTP_200_OK)
        
    except (Books.DoesNotExist, Students.DoesNotExist):
        print("Book or student not found:", student_id, book_id)
        return Response({
            "success": False,
            "message": "Book or student not found",
            "student": {"student_id": str(student_id), "student_name": None},
            "book": {"book_id": book_id, "title": None}
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def student_issues(request, student_id):
    print("Fetching issues for student_id:", student_id)
    try:
        student = Students.objects.get(id=student_id)
        active_issues = issues.objects.filter(student=student, return_date__isnull=True)
        
        issues_data = []
        for issue in active_issues:
            issues_data.append( {
                "book_id": issue.book.id,
                "title": issue.book.title,
                "author": issue.book.author,
                "borrow_date": issue.time.isoformat(),
                "due_date": issue.time + timezone.timedelta(days=OVERDUE_DAYS_LIMIT),  # Assuming 2 weeks borrow period
                "days_borrowed": (timezone.now() - issue.time).days
            })
        
        print("Found", len(issues_data), "active issues for student_id:", student_id)
        return Response({
            "success": True,
            "student": {"student_id": str(student.id), "student_name": student.name},
            "issues": issues_data
        }, status=status.HTTP_200_OK)
        
    except Students.DoesNotExist:
        print("Student not found:", student_id)
        return Response({
            "success": False,
            "message": "Student not found",
            "student": {"student_id": str(student_id), "student_name": None},
            "issues": []
        }, status=status.HTTP_404_NOT_FOUND)
    


@api_view(['GET'])
def overdue_list(request):
    print("Fetching overdue issues")
    overdue_issues = issues.objects.filter(return_date__isnull=True, time__lt=timezone.now() - timezone.timedelta(days=OVERDUE_DAYS_LIMIT))
    
    overdue_data = []
    for issue in overdue_issues:
        days_overdue = (timezone.now() - (issue.time + timezone.timedelta(days=OVERDUE_DAYS_LIMIT))).days
        overdue_data.append({
            "book_id": issue.book.id,
            "title": issue.book.title,
            "borrower": {
            "student_id": str(issue.student.student_id),
            "student_name": issue.student.name,
            "borrow_date": issue.time.isoformat()
            },
            "due_date": (issue.time + timezone.timedelta(days=OVERDUE_DAYS_LIMIT)).isoformat(),
            "days_overdue": days_overdue
        })
    
    print("Found", len(overdue_data), "overdue issues")
    return Response({
        "success": True,
        "overdue_issues": overdue_data
    }, status=status.HTTP_200_OK)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import issues
from collections import defaultdict
import re

@api_view(['GET'])
def all_issues(request):
    print("Fetching all issues")

    all_issues = issues.objects.select_related('book', 'student').order_by('-time')
    
    # Dictionary to group by class_id
    class_reports = defaultdict(lambda: {
        "class_id": "",
        "class_name": "",
        "total_books_borrowed": 0,
        "most_borrowed_books": defaultdict(lambda: {"book_id": None, "title": "", "borrow_count": 0})
    })

    for issue in all_issues:
        student_id = str(issue.student.student_id)
        
        # Extract class_id from student_id using pattern like IA25-001 -> 25
        match = re.search(r"[A-Z]{2}(\d{2})-", student_id)
        class_id = match.group(1) if match else "Unknown"

        # Initialize class entry
        class_entry = class_reports[class_id]
        class_entry["class_id"] = class_id
        class_entry["class_name"] = f"Batch 20{class_id}"
        class_entry["total_books_borrowed"] += 1

        # Track borrow count per book
        book_id = issue.book.id
        book_title = issue.book.title
        book_entry = class_entry["most_borrowed_books"][book_id]
        book_entry["book_id"] = book_id
        book_entry["title"] = book_title
        book_entry["borrow_count"] += 1

    # Convert defaultdicts to normal lists
    formatted_reports = []
    for cid, class_info in class_reports.items():
        books_list = list(class_info["most_borrowed_books"].values())
        # Sort most borrowed books descending by borrow_count
        books_list.sort(key=lambda x: x["borrow_count"], reverse=True)
        formatted_reports.append({
            "class_id": class_info["class_id"],
            "class_name": class_info["class_name"],
            "total_books_borrowed": class_info["total_books_borrowed"],
            "most_borrowed_books": books_list[:3]  # top 3
        })

    print("Found", len(formatted_reports), "classes")
    return Response({
        "success": True,
        "reports": formatted_reports
    }, status=status.HTTP_200_OK)
