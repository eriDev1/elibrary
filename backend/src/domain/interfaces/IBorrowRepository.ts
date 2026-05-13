import { BorrowRecord } from '../entities/BorrowRecord';

export interface BorrowReportItem {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  member_id: string;
  member_name: string;
  member_email: string;
  member_type: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
}

export interface IBorrowRepository {
  create(record: BorrowRecord): Promise<BorrowRecord>;
  findActiveByBookId(bookId: string): Promise<BorrowRecord | undefined>;
  markReturned(bookId: string, returnDate: Date): Promise<boolean>;
  findAllWithDetails(): Promise<BorrowReportItem[]>;
}
