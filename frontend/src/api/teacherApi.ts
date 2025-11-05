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


let mockBooks: Book[];

let mockStudents: Student[];

let borrowedBooks: Borrow[];

const BASE_URL = import.meta.env.VITE_BASE_URL;

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
