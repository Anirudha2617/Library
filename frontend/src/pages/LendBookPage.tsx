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
 <div className="min-h-screen bg-gray-50">
  <PageHeader 
    title="Lend Book" 
    description="Issue books to students"
  />

  <div className="p-6 max-w-2xl mx-auto space-y-6">
    {/* Lend Book Card */}
    <Card className="shadow-lg border border-gray-200 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
          <Plus className="w-5 h-5 text-primary" />
          <span>Issue New Book</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {success && (
          <Alert className="mb-6 border-l-4 border-accent text-accent-foreground bg-accent/10 rounded-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLendBook} className="space-y-6">
          {/* Student Search */}
          <div className="space-y-2">
            <Label htmlFor="studentId" className="flex items-center space-x-2 text-sm font-medium">
              <User className="w-4 h-4 text-gray-600" />
              <span>Student Search</span>
            </Label>
            <AutocompleteInput
              type="student"
              placeholder="Search by student ID or name..."
              value={studentId}
              onChange={(val: string) => {
                setStudentId(val);
                setSelectedStudent(null);
              }}
              onSelect={(student: any) => {
                setSelectedStudent(student);
                setStudentId(student.student_id);
              }}
              searchFunction={searchStudents}
              className="w-full rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary px-3 py-2 text-sm"
            />
            {selectedStudent && (
              <div className="p-3 mt-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <p className="font-medium text-gray-800">{selectedStudent.student_name}</p>
                <p className="text-sm text-gray-500">
                  {selectedStudent.student_id} • Class {selectedStudent.class} • 
                  {selectedStudent.books_to_return} borrowed
                </p>
              </div>
            )}
          </div>

          {/* Book Search */}
          <div className="space-y-2">
            <Label htmlFor="bookQuery" className="flex items-center space-x-2 text-sm font-medium">
              <BookOpen className="w-4 h-4 text-gray-600" />
              <span>Book Search</span>
            </Label>
            <AutocompleteInput
              type="book"
              placeholder="Search by title, author, or ISBN..."
              value={bookQuery}
              onChange={(val: string) => {
                setBookQuery(val);
                setSelectedBook(null);
              }}
              onSelect={(book: any) => {
                setSelectedBook(book);
                setBookQuery(book.title);
              }}
              searchFunction={searchBooks}
              className="w-full rounded-md border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary px-3 py-2 text-sm"
            />
            {selectedBook && (
              <div className="p-3 mt-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <p className="font-medium text-gray-800">{selectedBook.title}</p>
                <p className="text-sm text-gray-500">
                  by {selectedBook.author} • 
                  <span className={selectedBook.available_quantity === 0 ? "text-red-600 font-semibold" : "text-green-600"}>
                    {selectedBook.available_quantity} available
                  </span>
                  {selectedBook.available_quantity === 0 && " (Out of Stock)"}
                </p>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full flex justify-center items-center space-x-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg py-3"
            size="lg"
            disabled={loading || !selectedStudent || !selectedBook || selectedBook?.available_quantity === 0}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Lend Book</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>

    {/* Quick Tips */}
    <Card className="shadow-lg border border-gray-200 rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Tips</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-gray-500 list-disc list-inside">
          <li>Student IDs are case-sensitive (e.g., S101, not s101)</li>
          <li>You can search books by partial title or author name</li>
          <li>ISBN search requires the complete number</li>
          <li>Books are automatically due OVERDUE_DAYS_LIMIT days from today</li>
        </ul>
      </CardContent>
    </Card>
  </div>
</div>

  );
}