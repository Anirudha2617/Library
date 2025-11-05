from django.shortcuts import render
from rest_framework import viewsets
from .serializers import student_serializer
from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Students


# Create your views here.
class studentsViews(APIView):
    permission_classes = [AllowAny]

    def get(self , request):
        print("Self:", self)
        print("Request : ", request)
        
        serializer = student_serializer(Students.objects.all() ,many=True)
        for i in serializer.data:
            print(i)
        return Response(serializer.data)
