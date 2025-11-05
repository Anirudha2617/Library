import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import BooksPage from "./pages/BooksPage";
import BorrowedBooksPage from "./pages/BorrowedBooksPage";
import LendBookPage from "./pages/LendBookPage";
import ReturnBookPage from "./pages/ReturnBookPage";
import OverdueBooksPage from "./pages/OverdueBooksPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";
import ClassBorrow from "./pages/ClassBorrow";  

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/" element={<BooksPage />} />
            <Route path="/borrowed" element={<BorrowedBooksPage />} />
            <Route path="/lend" element={<LendBookPage />} />
            <Route path="/return" element={<ReturnBookPage />} />
            <Route path="/overdue" element={<OverdueBooksPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            {/* Placeholder routes for missing pages */}
            <Route path="/class-borrow" element={<ClassBorrow />} />
            <Route path="/student" element={<div className="p-6"><h1 className="text-2xl font-bold">Student View - Coming Soon</h1></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
