import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/SearchBar";
import PageHeader from "@/components/PageHeader";
import type { Book } from "@/types/teacherTypes";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {


    const fetchBooks = async () => {
      try {
        const { getAllBooks } = await import("@/api/teacherApi");
        const response = await getAllBooks();
        console.log(response );
        // Normalize borrowed_by to always be an array
        const normalizedBooks = response.map((book: Book) => ({
          ...book,
          borrowed_by: book.borrowed_by || [],
        }));

        setBooks(normalizedBooks);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.isbn?.includes(searchTerm) ?? false)
  );

  const toggleExpanded = (bookId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(bookId)) {
      newExpanded.delete(bookId);
    } else {
      newExpanded.add(bookId);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Books" description="Manage your library collection" />
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-48 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32 mb-1"></div>
                <div className="h-3 bg-muted rounded w-40"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Books" description="Manage your library collection">
        <SearchBar
          placeholder="Search by title, author, or ISBN..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-80"
        />
      </PageHeader>

      <div className="p-6 space-y-4">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="transition-all duration-200 hover:shadow-md">
            <CardContent className="p-0">
              {/* Main Row */}
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{book.title}</h3>
                    <p className="text-muted-foreground">{book.author}</p>
                    <p className="text-xs text-muted-foreground">ISBN: {book.isbn || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{book.total_quantity}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{book.available_quantity || 0}</p>
                    <p className="text-xs text-muted-foreground">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{book.borrowed_by.length}</p>
                    <p className="text-xs text-muted-foreground">Borrowed</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(book.id)}
                    className="flex items-center space-x-1"
                  >
                    {expandedRows.has(book.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span>Details</span>
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedRows.has(book.id) && book.borrowed_by.length > 0 && (
                <div className="border-t bg-muted/30 p-6">
                  <h4 className="font-medium text-foreground mb-4">Currently Borrowed By:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {book.borrowed_by.map((borrower) => (
                      <div
                        key={borrower.student_id}
                        className="flex items-center justify-between p-3 bg-background rounded-lg border"
                      >
                        <div>
                          <p className="font-medium text-foreground">{borrower.student_name}</p>
                          <p className="text-sm text-muted-foreground">{borrower.student_id}</p>
                        </div>
                        <Badge variant="secondary">
                          {new Date(borrower.borrow_date).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredBooks.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No books found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "No books in the library yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
