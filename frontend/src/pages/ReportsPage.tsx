import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import type { ClassUsageReport } from "@/types/teacherTypes";
import { getUsageReport } from "@/api/teacherApi";

export default function ReportsPage() {
  const [reports, setReports] = useState<ClassUsageReport[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getUsageReport();
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching class usage reports:", error);
      }
      setLoading(false);
    };

    fetchReports();

  }, []);

  const filteredReports = selectedClass === "all" 
    ? reports 
    : reports.filter(report => report.class_id === selectedClass);

  const totalBooks = reports.reduce((sum, report) => sum + report.total_books_borrowed, 0);
  const averageBooksPerClass = Math.round(totalBooks / reports.length);
  const mostActiveClass = reports.reduce((max, report) => 
    report.total_books_borrowed > max.total_books_borrowed ? report : max
  , reports[0] || { class_name: "N/A", total_books_borrowed: 0 });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Reports" description="Library usage analytics and insights" />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
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
        title="Reports" 
        description="Library usage analytics and insights"
      >
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {reports.map(report => (
              <SelectItem key={report.class_id} value={report.class_id}>
                {report.class_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="p-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books Borrowed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalBooks}</div>
              <p className="text-xs text-muted-foreground">Across all classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average per Class</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{averageBooksPerClass}</div>
              <p className="text-xs text-muted-foreground">Books per class</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Active Class</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{mostActiveClass?.class_name}</div>
              <p className="text-xs text-muted-foreground">{mostActiveClass?.total_books_borrowed} books</p>
            </CardContent>
          </Card>
        </div>

        {/* Class Usage Reports */}
        <div className="space-y-6">
          {filteredReports.map((report) => (
            <Card key={report.class_id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>{report.class_name}</span>
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{report.total_books_borrowed}</div>
                    <div className="text-sm text-muted-foreground">Total Borrowed</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-medium text-foreground mb-4">Most Popular Books</h4>
                  <div className="space-y-3">
                    {report.most_borrowed_books.map((book, index) => (
                      <div key={book.book_id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium text-foreground">{book.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full"
                              style={{ 
                                width: `${(book.borrow_count / Math.max(...report.most_borrowed_books.map(b => b.borrow_count))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground w-8 text-right">
                            {book.borrow_count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Reports Available</h3>
              <p className="text-muted-foreground">
                No usage data found for the selected criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}