from django.contrib import admin
from .models import Books, Publisher


@admin.register(Publisher)
class PublisherAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "contact")
    search_fields = ("name", "address", "contact")


@admin.register(Books)
class BooksAdmin(admin.ModelAdmin):
    list_display = (
        "book_no", "title", "author", "publisher", "quantity", 
        "price", "published_year", "date_of_issue"
    )
    list_filter = ("publisher", "published_year", "date_of_issue")
    search_fields = ("book_no", "title", "author", "bill_no", "catelog_no")
    ordering = ("title",)
    autocomplete_fields = ("publisher",) 