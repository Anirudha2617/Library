from django.urls import path

from .views import studentsViews 

urlpatterns = [
    path('' , studentsViews.as_view() , name= "students")
]