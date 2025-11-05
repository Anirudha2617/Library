from django.urls import path
from . import views

urlpatterns = [
    # path('', views.issue_list, name='issue_list'),
    # path('<int:pk>/', views.issue_detail, name='issue_detail'),
    path('<int:student_id>/<int:book_id>/', views.lend_book, name='lend_book'),
    path('<int:student_id>/', views.student_issues, name='student_issues'),
    path('return/<int:student_id>/<int:book_id>/', views.return_book, name='return_book'),
    path('overdue/', views.overdue_list, name='overdue_issues'),
    path('report/', views.all_issues, name='all_issues'),
    # Add more paths as needed
]