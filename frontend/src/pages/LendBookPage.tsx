import { useState } from "react";
import { Plus, User, BookOpen, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PageHeader from "@/components/PageHeader";
import AutocompleteInput from "@/components/AutocompleteInput";
import { useToast } from "@/hooks/use-toast";
import { searchBooks, searchStudents, lendBook, returnBook} from "@/api/teacherApi";

export default function LendBookPage() {
  const [studentId, setStudentId] = useState("");
  const [bookQuery, setBookQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLendBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedBook) {
      toast({
        title: "Missing Information",
        description: "Please select both a student and a book.",
        variant: "destructive",
      });
      return;
    }

    if (selectedBook.available_quantity === 0) {
      toast({
        title: "Book Unavailable",
        description: "This book is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      setLoading(true);

      const response = await lendBook({
        student_id: selectedStudent.id,
        book_id: selectedBook.id,
      });

      const { success, message, student, book } = response.data;

      if (success) {
        setSuccess(`Book "${book.title}" successfully lent to ${student.student_name}`);

        toast({
          title: "Book Lent Successfully",
          description: `${book.title} has been lent to ${student.student_name}`,
        });

        // Reset form
        setStudentId("");
        setBookQuery("");
        setSelectedStudent(null);
        setSelectedBook(null);

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        toast({
          title: "Lending Failed",
          description: message || "Something went wrong.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to lend book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Lend Book" 
        description="Issue books to students"
      />

      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-primary" />
              <span>Issue New Book</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-6 border-accent text-accent-foreground bg-accent/10">
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLendBook} className="space-y-6">
              {/* Student Search */}
              <div className="space-y-2">
                <Label htmlFor="studentId" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Student Search</span>
                </Label>
                <AutocompleteInput
                  type="student"
                  placeholder="Search by student ID or name..."
                  value={studentId}
                  onChange={setStudentId}
                  onSelect={setSelectedStudent}
                  searchFunction={searchStudents}
                />
                {selectedStudent && (
                  <div className="p-3 bg-accent/20 rounded-lg border">
                    <p className="font-medium text-foreground">{selectedStudent.student_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudent.student_id} • Class {selectedStudent.class} • 
                      {selectedStudent.books_to_return} currently borrowed
                    </p>
                  </div>
                )}
              </div>

              {/* Book Search */}
              <div className="space-y-2">
                <Label htmlFor="bookQuery" className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Book Search</span>
                </Label>
                <AutocompleteInput
                  type="book"
                  placeholder="Search by title, author, or ISBN..."
                  value={bookQuery}
                  onChange={setBookQuery}
                  onSelect={setSelectedBook}
                  searchFunction={searchBooks}
                />
                {selectedBook && (
                  <div className="p-3 bg-accent/20 rounded-lg border">
                    <p className="font-medium text-foreground">{selectedBook.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {selectedBook.author} • 
                      <span className={selectedBook.available_quantity === 0 ? "text-destructive font-medium" : "text-accent"}>
                        {selectedBook.available_quantity} available
                      </span>
                      {selectedBook.available_quantity === 0 && " (Out of Stock)"}
                    </p>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading || !selectedStudent || !selectedBook || selectedBook?.available_quantity === 0}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Lend Book
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Student IDs are case-sensitive (e.g., S101, not s101)</li>
              <li>• You can search books by partial title or author name</li>
              <li>• ISBN search requires the complete number</li>
              <li>• Books are automatically due OVERDUE_DAYS_LIMIT days from today</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}