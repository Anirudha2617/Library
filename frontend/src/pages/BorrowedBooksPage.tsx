import { useState, useEffect } from "react";
import { BookMarked, Users, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import type { Book } from "@/types/teacherTypes";
import { getBorrowedBooks } from "@/api/teacherApi";

// Mock data for demo - only borrowed books
// const mockBorrowedBooks: Book[] = [
//   {
//     id: 1,
//     title: "To Kill a Mockingbird",
//     author: "Harper Lee",
//     isbn: "978-0-06-112008-4",
//     total_quantity: 5,
//     available_quantity: 2,
//     borrowed_by: [
//       { student_id: "S101", student_name: "Alice Johnson", borrow_date: "2024-09-10" },
//       { student_id: "S102", student_name: "Bob Smith", borrow_date: "2024-09-12" },
//       { student_id: "S103", student_name: "Carol Davis", borrow_date: "2024-09-14" }
//     ]
//   },
//   {
//     id: 2,
//     title: "1984",
//     author: "George Orwell",
//     isbn: "978-0-452-28423-4",
//     total_quantity: 4,
//     available_quantity: 2,
//     borrowed_by: [
//       { student_id: "S104", student_name: "David Lee", borrow_date: "2024-09-11" },
//       { student_id: "S105", student_name: "Eva Green", borrow_date: "2024-09-13" }
//     ]
//   }
// ];





export default function BorrowedBooksPage() {
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        const response = await getBorrowedBooks();
        setBorrowedBooks(response);
        console.log("Borrowed Books:", response);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch borrowed books:", error);
      }
    };
    fetchBorrowedBooks();
  }, []);

  const toggleExpanded = (bookId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(bookId)) {
      newExpanded.delete(bookId);
    } else {
      newExpanded.add(bookId);
    }
    setExpandedRows(newExpanded);
  };

  const totalBorrowed = borrowedBooks.reduce((sum, book) => sum + book.borrowed_by.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Borrowed Books" description="Currently checked out books" />
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Borrowed Books" 
        description="Currently checked out books"
      >
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{borrowedBooks.length}</div>
            <div className="text-xs text-muted-foreground">Books</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{totalBorrowed}</div>
            <div className="text-xs text-muted-foreground">Copies</div>
          </div>
        </div>
      </PageHeader>

      <div className="p-6">
        {borrowedBooks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BookMarked className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Books Currently Borrowed</h3>
              <p className="text-muted-foreground">
                All books have been returned. Great job!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {borrowedBooks.map((book) => (
              <Card key={book.id} className="transition-all duration-200 hover:shadow-md border-l-4 border-l-primary">
                <CardContent className="p-0">
                  {/* Main Row */}
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookMarked className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{book.title}</h3>
                        <p className="text-muted-foreground">{book.author}</p>
                        <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-2xl font-bold text-primary">{book.borrowed_by.length}</span>
                        <span className="text-muted-foreground">
                          {book.borrowed_by.length === 1 ? "student" : "students"}
                        </span>
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
                        <span>View Students</span>
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedRows.has(book.id) && (
                    <div className="border-t bg-muted/30 p-6">
                      <h4 className="font-medium text-foreground mb-4">Borrowed By:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {book.borrowed_by.map((borrower) => (
                          <Card key={borrower.student_id} className="border-l-4 border-l-accent">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-foreground">{borrower.student_name}</p>
                                  <p className="text-sm text-muted-foreground">{borrower.student_id}</p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="secondary">
                                    {new Date(borrower.borrow_date).toLocaleDateString()}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {Math.floor((Date.now() - new Date(borrower.borrow_date).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}