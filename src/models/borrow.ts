interface BorrowUser {
  _id: string;
  name: string;
  email: string;
  class: string;
}

interface BorrowItem {
  _id: string;
  code: string;
  name: string;
  category: string;
  id: string;
}

interface BorrowItemDetail {
  item: BorrowItem | null;
  condition: string;
  notes?: string;
  _id: string;
  id: string;
}

export interface Borrow {
  _id: string;
  user: BorrowUser;
  items: BorrowItemDetail[];
  dueDate: string;
  status: 'pending' | 'borrowed' | 'returned' | 'rejected';
  purpose: string;
  borrowCode: string;
  borrowDate: string;
  createdAt: string;
  updatedAt: string;
  isLate: boolean;
  duration: number;
  id: string;
}

export interface BorrowsQueryParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

export interface BorrowsResponse {
  status: string;
  results: number;
  total: number;
  data: {
    borrows: Borrow[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 