import { useState, useEffect } from "react";
import { Clock, AlertTriangle, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import type { OverdueBook } from "@/types/teacherTypes";
import { getOverdueBooks } from "@/api/teacherApi";

// Mock data for demo
// const mockOverdueBooks: OverdueBook[] = [
//   {
//     book_id: 1,
//     title: "To Kill a Mockingbird",
//     borrower: {
//       student_id: "S101",
//       student_name: "Alice Johnson",
//       borrow_date: "2024-08-20"
//     },
//     due_date: "2024-09-03",
//     days_overdue: 23
//   },
//   {
//     book_id: 2,
//     title: "1984",
//     borrower: {
//       student_id: "S104",
//       student_name: "David Lee",
//       borrow_date: "2024-08-25"
//     },
//     due_date: "2024-09-08",
//     days_overdue: 18
//   },
//   {
//     book_id: 5,
//     title: "The Great Gatsby",
//     borrower: {
//       student_id: "S107",
//       student_name: "Emma Wilson",
//       borrow_date: "2024-09-01"
//     },
//     due_date: "2024-09-15",
//     days_overdue: 11
//   }
// ];

export default function OverdueBooksPage() {
  const [overdueBooks, setOverdueBooks] = useState<OverdueBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverdueBooks = async () => {
      try {
        const response = await getOverdueBooks();
        setOverdueBooks(response.data);
      } catch (error) {
        console.error("Error fetching overdue books:", error);
      }
      setLoading(false);
    };

    fetchOverdueBooks();
    // Simulate API call
    // setTimeout(() => {
    //   setOverdueBooks(mockOverdueBooks);
    //   setLoading(false);
    // }, 1000);
  }, []);

  const getSeverityColor = (daysOverdue: number) => {
    if (daysOverdue >= 30) return "bg-destructive text-destructive-foreground";
    if (daysOverdue >= 14) return "bg-warning text-warning-foreground";
    return "bg-orange-500 text-white";
  };

  const getSeverityLabel = (daysOverdue: number) => {
    if (daysOverdue >= 30) return "Critical";
    if (daysOverdue >= 14) return "High";
    return "Medium";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Overdue Books" description="Track and manage overdue returns" />
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
        title="Overdue Books" 
        description="Track and manage overdue returns"
      >
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>1-13 days</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span>14-29 days</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            <span>30+ days</span>
          </div>
        </div>
      </PageHeader>

      <div className="p-6">
        {overdueBooks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Overdue Books</h3>
              <p className="text-muted-foreground">
                Great job! All books have been returned on time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-destructive">{overdueBooks.length}</div>
                  <div className="text-sm text-muted-foreground">Total Overdue</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-warning">
                    {overdueBooks.filter(book => book.days_overdue >= 14).length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.max(...overdueBooks.map(book => book.days_overdue))}
                  </div>
                  <div className="text-sm text-muted-foreground">Max Days Overdue</div>
                </CardContent>
              </Card>
            </div>

            {/* Overdue Books List */}
            {overdueBooks
              .sort((a, b) => b.days_overdue - a.days_overdue)
              .map((book) => (
                <Card key={`${book.book_id}-${book.borrower.student_id}`} className="border-l-4 border-l-destructive">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-16 bg-destructive/10 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{book.title}</h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">{book.borrower.student_name}</p>
                              <p className="text-xs text-muted-foreground">{book.borrower.student_id}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <p>Borrowed: {new Date(book.borrower.borrow_date).toLocaleDateString()}</p>
                              <p>Due: {new Date(book.due_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <Badge className={getSeverityColor(book.days_overdue)}>
                            {getSeverityLabel(book.days_overdue)}
                          </Badge>
                          <p className="text-2xl font-bold text-destructive mt-1">{book.days_overdue}</p>
                          <p className="text-xs text-muted-foreground">days overdue</p>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button variant="outline" size="sm" className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>Email</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}