from rest_framework import serializers
from .models import Students

class student_serializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='name')
    class_field = serializers.SerializerMethodField()
    books_to_return = serializers.SerializerMethodField()
    books_returned = serializers.SerializerMethodField()

    class Meta:
        model = Students
        fields = ['id','student_id', 'student_name', 'class_field', 'books_to_return', 'books_returned']

    def get_class_field(self, obj):
        return obj.student_id.split('-')[0] if obj.student_id else None
    
    def get_books_to_return(self, obj):
        return None
    
    
    def get_books_returned(self, obj):
        return None

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['class'] = rep.pop('class_field')   # rename key in final output
        return rep
