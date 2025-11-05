import type {
  Book,
  BookHistory,
  ClassBorrow,
  LendReturnResponse,
  StudentBorrowOverview,
  OverdueBook,
  ClassUsageReport,
  Student,
  Borrow,
} from "@/types/teacherTypes";

// Mock Data
// let mockBooks: Book[] = [
//   { id: 1, title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0-06-112008-4", total_quantity: 5, available_quantity: 2, borrowed_by: [{ student_id: "S101", student_name: "Alice Johnson", borrow_date: "2024-09-10" }] },
//   { id: 2, title: "1984", author: "George Orwell", isbn: "978-0-452-28423-4", total_quantity: 4, available_quantity: 0, borrowed_by: [{ student_id: "S104", student_name: "David Lee", borrow_date: "2024-09-11" }] },
//   { id: 3, title: "Pride and Prejudice", author: "Jane Austen", isbn: "978-0-14-143951-8", total_quantity: 3, available_quantity: 3, borrowed_by: [] },
//   { id: 4, title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0-7432-7356-5", total_quantity: 6, available_quantity: 1, borrowed_by: [{ student_id: "S102", student_name: "Bob Smith", borrow_date: "2024-09-12" }] },
//   { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", isbn: "978-0-316-76948-0", total_quantity: 4, available_quantity: 0, borrowed_by: [{ student_id: "S103", student_name: "Carol Davis", borrow_date: "2024-09-14" }] },
//   { id: 6, title: "Lord of the Flies", author: "William Golding", isbn: "978-0-571-05686-2", total_quantity: 5, available_quantity: 2, borrowed_by: [{ student_id: "S105", student_name: "Eva Green", borrow_date: "2024-09-13" }] },
//   { id: 7, title: "Animal Farm", author: "George Orwell", isbn: "978-0-452-28424-1", total_quantity: 3, available_quantity: 0, borrowed_by: [{ student_id: "S106", student_name: "Frank Miller", borrow_date: "2024-09-15" }] },
//   { id: 8, title: "Brave New World", author: "Aldous Huxley", isbn: "978-0-06-085052-4", total_quantity: 4, available_quantity: 1, borrowed_by: [{ student_id: "S107", student_name: "Grace Wilson", borrow_date: "2024-09-16" }] },
//   { id: 9, title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "978-0-547-92822-7", total_quantity: 7, available_quantity: 3, borrowed_by: [{ student_id: "S108", student_name: "Henry Brown", borrow_date: "2024-09-17" }] },
//   { id: 10, title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", isbn: "978-0-439-70818-8", total_quantity: 8, available_quantity: 0, borrowed_by: [{ student_id: "S109", student_name: "Isabel Clark", borrow_date: "2024-09-18" }] }
// ];

// const mockStudents = [
//   { student_id: "S101", student_name: "Alice Johnson", class: "10A", books_to_return: 3, books_returned: 12 },
//   { student_id: "S102", student_name: "Bob Smith", class: "10B", books_to_return: 2, books_returned: 8 },
//   { student_id: "S103", student_name: "Carol Davis", class: "10A", books_to_return: 1, books_returned: 15 },
//   { student_id: "S104", student_name: "David Lee", class: "11A", books_to_return: 4, books_returned: 6 },
//   { student_id: "S105", student_name: "Eva Green", class: "11B", books_to_return: 2, books_returned: 10 },
//   { student_id: "S106", student_name: "Frank Miller", class: "12A", books_to_return: 1, books_returned: 20 },
//   { student_id: "S107", student_name: "Grace Wilson", class: "12B", books_to_return: 3, books_returned: 14 },
//   { student_id: "S108", student_name: "Henry Brown", class: "10A", books_to_return: 2, books_returned: 9 },
//   { student_id: "S109", student_name: "Isabel Clark", class: "11A", books_to_return: 1, books_returned: 11 },
//   { student_id: "S110", student_name: "Jack Davis", class: "10B", books_to_return: 0, books_returned: 7 }
// ];

let mockBooks: Book[];

let mockStudents: Student[];

let borrowedBooks: Borrow[];

const BASE_URL = "http://127.0.0.1:8000/"

// Simulate 2-second delay for all API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 📚 Books
export const getAllBooks = async (): Promise<Book[]> => {
  const response = await fetch(`${BASE_URL}api/books/`, {
    method: "GET",
    headers: {
      "Content-Type":"application/json",
    }
  });
  if (!response.ok){
    throw new Error(`HTTP Error status: ${response.status}`)
  }
  const data = await response.json();
  mockBooks = data;
  console.log("Mockbooks:",mockBooks);
  return data;
};

export const getAllStudents = async (): Promise<Student[]> => {
  const response = await fetch( `${BASE_URL}api/students/`, {
    method: "GET",
    headers: {
      "Content-Type":"application/json",
    }
  });
  if (!response.ok){
    throw new Error(`HTTP Error status: ${response.status}`)
  }
  const data = await response.json();
  mockStudents = data;
  console.log("Mckstudents:",mockStudents);
  return data;
};

export const getBookHistory = async (bookId: number): Promise<{ data: BookHistory }> => {
  await delay(2000);
  const book = await fetch( `${BASE_URL}api/books/${bookId}/history/`, {
    method: "GET",
    headers: {
      "Content-Type":"application/json",
    }
  });
  if (!book.ok){
    throw new Error(`HTTP Error status: ${book.status}`)
  }
  const data = await book.json();
  console.log("Book History Data:",data);
  return {
    data
  };
};

    // How to use it
    // import { getBookHistory } from "@/api/teacherApi";
    // const books = async () => {
    //   try {
    //     const response = await getBookHistory(1);
    //     console.log("Book History Response",response );
    //   }
    //   catch (error) {
    //     console.error("Failed to fetch book history:", error);
    //   }
    // };


// 📊 Borrowed


export const getBorrowedBooks = async (): Promise<Borrow[]> => {
  console.log("Fetching borrowed books...");
  const response = await fetch( `${BASE_URL}api/books/borrowed/`, {
    method: "GET",
    headers: { 
      "Content-Type":"application/json",
    }
  });
  if (!response.ok){
    throw new Error(`HTTP Error status: ${response.status}`)
  }
  const data = await response.json();
  console.log("Fetched borrowed books data:",data);
  console.log("Borrowed Books Data:",data);
  borrowedBooks = data;
  return data ;

};



export const getClassBorrowedBooks = async (
  batchId: string
): Promise<{ data: ClassBorrow }> => {
  if (!batchId) {
    throw new Error("Batch ID is required");
  }
  if (!mockBooks || mockBooks.length === 0) {
    mockBooks = await getAllBooks();
  }

  // Normalize batchId (e.g. "25" → "25")
  const normalizedBatchId = batchId.trim();
  console.log("Normalized Batch ID:", normalizedBatchId);

  // Filter only those books where at least one borrower is from that batch
  const pattern = new RegExp(`^[A-Z]{2}${normalizedBatchId}-\\d{3}$`);
  const batchBorrowedBooks = mockBooks
    .map((book) => {
      const matchedBorrowers = book.borrowed_by.filter((borrower) =>
        pattern.test(borrower.student_id)
      );
      book.borrowed_by.forEach((b) => {
      console.log(
          `Matched Borrower for book "${book.title}":`,
          b.student_id,
          "=>",
          pattern.test(b.student_id)
        );
      });

      const borrowers = book.borrowed_by;
      if (matchedBorrowers.length > 0) {
        return {
          ...book,
          borrowed_by: matchedBorrowers,
        };
      }
      return null;
    })
    .filter((book) => book !== null);

  // Construct response object
  const data: ClassBorrow = {
    class_id: normalizedBatchId,
    class_name: `Batch 20${normalizedBatchId}`,
    borrowed_books: batchBorrowedBooks.map((book) => ({
      book_id: book.id,
      book_no: book.book_no,
      title: book.title,
      author: book.author,
      publisher: book.publisher?.name ?? "",
      borrowed_by: book.borrowed_by,
    })),
  };
  console.log("Class Borrow Data:", data);

  return { data };
};


// ➕ Lend / 🔄 Return
export const lendBook = async (payload: { student_id: string; book_id: number }): Promise<{ data: LendReturnResponse }> => {

  const response = await fetch( `${BASE_URL}api/issues/${payload.student_id}/${payload.book_id}/`, {
    method: "POST",
    headers: {
      "Content-Type":"application/json",
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok && !data.message){
    throw new Error(`HTTP Error status: ${response.status}`)
  }

  return { data };
};

export const returnBook = async (payload: { student_id: string; book_id: number }) => {
  const student = mockStudents.find(s => s.student_id === payload.student_id);
  const response = await fetch(`${BASE_URL}api/issues/return/${student.id}/${payload.book_id}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    // surface backend error message properly
    throw new Error(data?.message || `HTTP error ${response.status}`);
  }

  return { data };
};


// 👤 Student
export const getStudentBorrowed = async (studentId: string): Promise<{ data: StudentBorrowOverview }> => {
  await delay(2000);
  const student = mockStudents.find(s => s.student_id === studentId);
  const currentBorrowed = mockBooks
    .filter(book => book.borrowed_by.some(b => b.student_id === studentId))
    .map(book => ({
      book_id: book.id,
      title: book.title,
      borrow_date: book.borrowed_by.find(b => b.student_id === studentId)?.borrow_date || ""
    }));

  return {
    data: {
      student_id: studentId,
      student_name: student?.student_name || "Unknown Student",
      current_borrowed: currentBorrowed,
      past_history: []
    }
  };
};

export const getStudent = async (studentId: string): Promise<{ data: any }> => {
  await delay(2000);
  const student = mockStudents.find(s => s.student_id === studentId);
  return { data: student || null };
};

// ⏰ Overdue
export const getOverdueBooks = async (): Promise<{ data: OverdueBook[] }> => {
  await delay(2000);
  const response = await fetch(`${BASE_URL}api/issues/overdue/`, {
    method: "GET",
    headers: {
      "Content-Type":"application/json",
    }
  });
  if (!response.ok){
    throw new Error(`HTTP Error status: ${response.status}`)
  }
  const data = await response.json();
  console.log("Overdue Books Data:",data);
  const overdueBooks: OverdueBook[] = data.overdue_issues;


  return { data: overdueBooks };
};

// 📈 Reports
export const getUsageReport = async (): Promise<{ data: ClassUsageReport[] }> => {
  console.log("Fetching Usage Report...");

  const uasgeReport = await fetch( `${BASE_URL}api/issues/report/`, {
    method: "GET",
    headers: {
      "Content-Type":"application/json",
    }
  });
  if (!uasgeReport.ok){
    throw new Error(`HTTP Error status: ${uasgeReport.status}`)
  }
  const data = await uasgeReport.json();
  console.log("Usage Report Data:",data);
  console.log("Reports:",data.reports);
  return { data: data.reports };

};


export const searchStudents = async (query: string): Promise<{ data: any[] }> => {
  if (!mockStudents || mockStudents.length === 0) {
    mockStudents = await getAllStudents();
  }

  console.log("All mockStudents:", mockStudents);
  const lowerQuery = query.toLowerCase();

  const results = mockStudents.filter(student =>
    (student.student_name && student.student_name.toLowerCase().includes(lowerQuery)) ||
    (student.student_id && student.student_id.toLowerCase().includes(lowerQuery))
  );
  console.log("Results:", results);
  return { data: results };
};

export const searchBooks = async (query: string): Promise<{ data: Book[] }> => {

  if (!mockBooks || mockBooks.length === 0) {
    mockBooks = await getAllBooks();
  }
  console.log("All mockbooks:", mockBooks);
  const results = mockBooks.filter((book) => {
    const titleMatch =
      book.title?.toLowerCase().includes(query.toLowerCase()) ?? false;
    const authorMatch =
      book.author?.toLowerCase().includes(query.toLowerCase()) ?? false;
    const isbnMatch = book.isbn?.includes(query) ?? false;

    return titleMatch || authorMatch || isbnMatch;
  });

  console.log("Results:", results);

  return { data: results };
};

export interface StudentBook {
  book_id: number;
  title: string;
  author: string;
  borrow_date: string;
  due_date: string;
  days_borrowed: number;
}

interface StudentBooks {
  [key: string]: StudentBook[];
}

export const searchStudentsBooks = async (studentId: string): Promise<StudentBook[]> => {
  console.log("Searching books for student ID:", studentId);
  if (!studentId.trim()) return [];

  if (!mockStudents || mockStudents.length === 0) {
    mockStudents = await getAllStudents();
  }

  const student = mockStudents.find(s => s.student_id === studentId);
  if (!student) return [];

  const response = await fetch(`${BASE_URL}api/issues/${student.id}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error status: ${response.status}`);
  }

  const data = await response.json();
  console.log("Student Books Data:", data);

  
  return data.issues;
};
