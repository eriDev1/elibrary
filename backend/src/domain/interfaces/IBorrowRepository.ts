import { BorrowRecord } from '../entities/BorrowRecord';

export interface IBorrowRepository {
  create(record: BorrowRecord): Promise<BorrowRecord>;
  findActiveByBookId(bookId: string): Promise<BorrowRecord | undefined>;
  markReturned(bookId: string, returnDate: Date): Promise<boolean>;
}
