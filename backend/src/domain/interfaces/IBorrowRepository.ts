import { BorrowRecord } from '../entities/BorrowRecord';
import { PagedList } from '../PagedList';

export interface BorrowListQuery {
  page: number;
  pageSize: number;
}

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

export interface MemberActiveBorrow {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_isbn: string;
  borrow_date: string;
  due_date: string;
}

export interface MemberBorrowHistoryEntry {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_isbn: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
}

export interface IBorrowRepository {
  create(record: BorrowRecord): Promise<BorrowRecord>;
  findActiveByBookId(bookId: string): Promise<BorrowRecord | undefined>;
  markReturned(bookId: string, returnDate: Date): Promise<boolean>;
  findAllWithDetails(query: BorrowListQuery): Promise<PagedList<BorrowReportItem>>;
  findActiveBorrowsForMember(
    memberId: string,
    query: BorrowListQuery
  ): Promise<PagedList<MemberActiveBorrow>>;
  findBorrowHistoryForMember(
    memberId: string,
    query: BorrowListQuery
  ): Promise<PagedList<MemberBorrowHistoryEntry>>;
}
