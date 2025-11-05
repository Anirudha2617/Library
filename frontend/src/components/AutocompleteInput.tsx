import { useState, useEffect, useRef } from "react";
import { Search, BookOpen, User, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Book } from "@/types/teacherTypes";

interface AutocompleteInputProps {
  type: "book" | "student";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: any) => void;
  searchFunction: (query: string) => Promise<{ data: any[] }>;
  className?: string;
}

export default function AutocompleteInput({
  type,
  placeholder,
  value,
  onChange,
  onSelect,
  searchFunction,
  className = ""
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const response = await searchFunction(value);
        setSuggestions(response.data);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value, searchFunction]);

  const handleSelect = (item: any) => {
    if (type === "book") {
      onChange(item.title);
    } else {
      onChange(item.student_id);
    }
    setShowSuggestions(false);
    onSelect?.(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const renderBookSuggestion = (book: Book, index: number) => (
    <div
      key={book.id}
      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
        index === selectedIndex ? "bg-accent" : "hover:bg-muted"
      }`}
      onClick={() => handleSelect(book)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-10 bg-primary/10 rounded flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className={`font-medium ${book.available_quantity === 0 ? 'text-destructive' : 'text-foreground'}`}>
            {book.title}
          </p>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={book.available_quantity === 0 ? "destructive" : "secondary"}>
          {book.available_quantity} available
        </Badge>
        {book.available_quantity === 0 && (
          <Badge variant="outline" className="text-destructive border-destructive">
            Out of Stock
          </Badge>
        )}
      </div>
    </div>
  );

  const renderStudentSuggestion = (student: any, index: number) => (
    <div
      key={student.student_id}
      className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
        index === selectedIndex ? "bg-accent" : "hover:bg-muted"
      }`}
      onClick={() => handleSelect(student)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">{student.student_name}</p>
          <p className="text-sm text-muted-foreground">{student.student_id}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant="secondary">{student.class}</Badge>
        <div className="text-right text-xs text-muted-foreground">
          <p>Borrowed: {student.books_to_return}</p>
          <p>Returned: {student.books_returned}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 text-lg"
        />
      </div>

      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-3 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions.length > 0 ? (
              <div>
                {suggestions.map((item, index) =>
                  type === "book"
                    ? renderBookSuggestion(item, index)
                    : renderStudentSuggestion(item, index)
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <p>No {type}s found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}