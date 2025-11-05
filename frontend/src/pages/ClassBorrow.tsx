import { useState } from "react";
import { getClassBorrowedBooks } from "@/api/teacherApi";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import { BookOpen, Users, Search } from "lucide-react";

export default function ClassBorrow() {
  const { toast } = useToast();
  const [batchId, setBatchId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"book" | "student">("book");

  const fetchBorrowedBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid batch ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await getClassBorrowedBooks(batchId.trim());
      setData(response.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch borrowed books.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Class Borrowed Books"
        description="View borrowed books by batch and student"
      >
        <form onSubmit={fetchBorrowedBooks} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Enter Batch ID (e.g., 25)"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-40"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Fetch
              </>
            )}
          </Button>
        </form>
      </PageHeader>

      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {data ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {data.class_name} —{" "}
                {viewMode === "book" ? "Book View" : "Student View"}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "book" ? "default" : "outline"}
                  onClick={() => setViewMode("book")}
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Book View
                </Button>
                <Button
                  variant={viewMode === "student" ? "default" : "outline"}
                  onClick={() => setViewMode("student")}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Student View
                </Button>
              </div>
            </div>

            {viewMode === "book" ? (
              // -------- BOOK VIEW --------
              <div className="space-y-4">
                {data.borrowed_books.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No borrowed books found
                      </h3>
                      <p className="text-muted-foreground">
                        This batch hasn’t borrowed any books yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  data.borrowed_books.map((book: any) => (
                    <Card
                      key={book.book_id}
                      className="transition-all duration-200 hover:shadow-md border-l-4 border-l-primary"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {book.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Book ID: {book.book_id}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {book.borrowed_by.length} Borrowed
                          </Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {book.borrowed_by.map((b: any, idx: number) => (
                            <Card
                              key={idx}
                              className="border-l-4 border-l-accent bg-muted/30"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {b.student_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {b.student_id}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant="outline">
                                      {new Date(
                                        b.borrow_date
                                      ).toLocaleDateString()}
                                    </Badge>
                                    {b.return_date ? (
                                      <p className="text-xs text-green-600 mt-1">
                                        Returned on{" "}
                                        {new Date(
                                          b.return_date
                                        ).toLocaleDateString()}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-red-500 mt-1">
                                        Not returned yet
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              // -------- STUDENT VIEW --------
              <div className="space-y-4">
                {(() => {
                  const studentMap: Record<
                    string,
                    {
                      student_name: string;
                      books: {
                        title: string;
                        borrow_date: string;
                        return_date?: string;
                      }[];
                    }
                  > = {};

                  data.borrowed_books.forEach((book: any) => {
                    book.borrowed_by.forEach((b: any) => {
                      if (!studentMap[b.student_id]) {
                        studentMap[b.student_id] = {
                          student_name: b.student_name,
                          books: [],
                        };
                      }
                      studentMap[b.student_id].books.push({
                        title: book.title,
                        borrow_date: b.borrow_date,
                        return_date: b.return_date,
                      });
                    });
                  });

                  const studentEntries = Object.entries(studentMap);
                  if (studentEntries.length === 0)
                    return (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-foreground mb-2">
                            No students found
                          </h3>
                          <p className="text-muted-foreground">
                            No borrowed records for this batch yet.
                          </p>
                        </CardContent>
                      </Card>
                    );

                  return studentEntries.map(([id, info]) => (
                    <Card
                      key={id}
                      className="transition-all duration-200 hover:shadow-md border-l-4 border-l-primary"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {info.student_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {id}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {info.books.length} Borrowed
                          </Badge>
                        </div>

                        <div className="space-y-2 ml-2">
                          {info.books.map((b, idx) => (
                            <div
                              key={idx}
                              className="p-3 border rounded-lg bg-muted/30 flex justify-between"
                            >
                              <div>
                                <p className="font-medium text-foreground">
                                  {b.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Borrowed on:{" "}
                                  {new Date(b.borrow_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                {b.return_date ? (
                                  <Badge variant="outline">
                                    Returned on{" "}
                                    {new Date(
                                      b.return_date
                                    ).toLocaleDateString()}
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    Not Returned
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ));
                })()}
              </div>
            )}
          </>
        ) : (
          !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Enter a Batch ID to fetch records
                </h3>
                <p className="text-muted-foreground">
                  You can view borrowed books for any batch using the form above.
                </p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
