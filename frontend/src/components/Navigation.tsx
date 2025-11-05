import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  BookMarked, 
  Users, 
  Plus, 
  RotateCcw, 
  User, 
  Clock, 
  BarChart3,
  GraduationCap
} from "lucide-react";

const navigationItems = [
  { path: "/", label: "Books", icon: BookOpen },
  { path: "/borrowed", label: "Borrowed", icon: BookMarked },
  { path: "/class-borrow", label: "Class Borrow", icon: Users },
  { path: "/lend", label: "Lend Book", icon: Plus },
  { path: "/return", label: "Return Book", icon: RotateCcw },
  { path: "/student", label: "Student", icon: User },
  { path: "/overdue", label: "Overdue", icon: Clock },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Teacher Portal</h1>
              <p className="text-xs text-muted-foreground">Library Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">Ms. Johnson</p>
              <p className="text-xs text-muted-foreground">Grade 10 Teacher</p>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">MJ</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}