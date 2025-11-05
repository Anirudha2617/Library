import csv
import os
import django
from datetime import datetime
import sys

# -------------------------------
# Setup Django environment
# -------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)

# Point to the correct settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from books.models import Books, Publisher


def import_publishers(publisher_file):
    with open(publisher_file, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            publisher, created = Publisher.objects.get_or_create(
                name=row['name'].strip(),
                defaults={
                    "address": row.get("address", ""),
                    "contact": row.get("contact", ""),
                }
            )
            if created:
                print(f"✅ Added publisher: {publisher.name}")
            else:
                print(f"ℹ️ Publisher already exists: {publisher.name}")


def import_books(book_file):
    with open(book_file, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            publisher_name = row['publisher'].strip()
            publisher, _ = Publisher.objects.get_or_create(name=publisher_name)

            # Parse optional fields safely
            def parse_date(date_str):
                try:
                    return datetime.strptime(date_str, "%Y-%m-%d").date()
                except Exception:
                    return None

            book, created = Books.objects.get_or_create(
                book_no=row['book_no'].strip(),
                defaults={
                    "title": row.get("title", ""),
                    "author": row.get("author", ""),
                    "date_of_issue": parse_date(row.get("date_of_issue", "")),
                    "quantity": int(row.get("quantity", 0)) if row.get("quantity") else None,
                    "publisher": publisher,
                    "vol": row.get("vol", ""),
                    "published_year": parse_date(row.get("published_year", "")),
                    "bill_no": row.get("bill_no", ""),
                    "price": float(row.get("price", 0)) if row.get("price") else None,
                    "catelog_no": row.get("catelog_no", ""),
                    "remarks": row.get("remarks", ""),
                }
            )

            if created:
                print(f"✅ Added book: {book.title}")
            else:
                print(f"ℹ️ Book already exists: {book.title}")


if __name__ == "__main__":
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    publishers_file = os.path.join(BASE_DIR, "publishers.csv")
    books_file = os.path.join(BASE_DIR, "books.csv")

    print("📚 Importing publishers...")
    import_publishers(publishers_file)

    print("\n📖 Importing books...")
    import_books(books_file)

    print("\n✅ Import completed successfully!")
