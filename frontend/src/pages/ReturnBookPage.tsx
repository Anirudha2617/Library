import { useState } from "react";
import { RotateCcw, User, BookOpen, CheckCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { returnBook, searchStudents, searchStudentsBooks, StudentBook } from "@/api/teacherApi";

export default function ReturnBookPage() {
  const [studentId, setStudentId] = useState("");
  const [studentBooks, setStudentBooks] = useState<StudentBook[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  // 🔍 Handle student ID input with live suggestions
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStudentId(value);

    // clear previous books immediately
    setStudentBooks([]);
    setSuccess(null);

    if (value.trim().length > 0) {
      try {
        const res = await searchStudents(value);
        setSuggestions(res.data || []);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // 🔎 Fetch borrowed books for a student (called when pressing enter or clicking search)
  const searchStudentBooks = async () => {
    if (!studentId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a student ID.",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    setSuggestions([]);
    setSuccess(null);

    try {
      const books = await searchStudentsBooks(studentId);
      setStudentBooks(books);

      if (books.length === 0) {
        toast({
          title: "No Books Found",
          description: `No borrowed books found for student ${studentId}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch borrowed books.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  // ✅ Properly handle return request with backend call
  const handleReturnBook = async (book: StudentBook) => {
    setLoading(true);
    try {
      const payload = { student_id: studentId, book_id: book.book_id };
      const res = await returnBook(payload);

      if (res?.data?.success) {
        setStudentBooks((prev) => prev.filter((b) => b.book_id !== book.book_id));
        setSuccess(`"${book.title}" returned successfully!`);
        toast({
          title: "Book Returned",
          description: `${book.title} has been returned by ${studentId}`,
        });
      } else {
        toast({
          title: "Error",
          description: res?.data?.message || "Failed to return the book.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Return Book" 
        description="Process book returns from students"
      />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-primary" />
              <span>Find Student</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-4 border-accent text-accent-foreground bg-accent/10">
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="relative">
              <Label htmlFor="studentId" className="flex items-center space-x-2 mb-2">
                <User className="w-4 h-4" />
                <span>Student ID</span>
              </Label>
              <div className="flex space-x-3">
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Enter student ID (e.g., S101)"
                  value={studentId}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      searchStudentBooks();
                    }
                  }}
                  className="text-lg"
                />
                <div className="flex items-end">
                  <Button 
                    onClick={searchStudentBooks}
                    disabled={searching}
                    className="px-6"
                  >
                    {searching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute z-10 bg-card border rounded-md shadow-md w-full mt-2">
                  {suggestions.map((student) => (
                    <div
                      key={student.student_id}
                      onClick={() => {
                        setStudentId(student.student_id);
                        setSuggestions([]);
                        searchStudentBooks();
                      }}
                      className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                    >
                      {student.student_name} ({student.student_id})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Borrowed Books List */}
        {studentBooks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Books Borrowed by {studentId}</span>
                <Badge variant="secondary">{studentBooks.length} books</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentBooks.map((book) => (
                  <div
                    key={book.book_id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      isOverdue(book.due_date) ? "border-destructive bg-destructive/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{book.title}</h3>
                        <p className="text-muted-foreground">{book.author}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-muted-foreground">
                            Borrowed: {new Date(book.borrow_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(book.due_date).toLocaleDateString()}
                          </p>
                          {isOverdue(book.due_date) && (
                            <Badge variant="destructive" className="text-xs">
                              OVERDUE
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-xl font-bold text-primary">{book.days_borrowed}</p>
                        <p className="text-xs text-muted-foreground">days</p>
                      </div>
                      <Button
                        onClick={() => handleReturnBook(book)}
                        disabled={loading}
                        className="flex items-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            <span>Return</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {studentId && studentBooks.length === 0 && !searching && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Books Found</h3>
              <p className="text-muted-foreground">
                Student {studentId} has no borrowed books to return.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
