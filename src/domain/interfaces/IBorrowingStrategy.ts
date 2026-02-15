import { Book } from '../entities/Book';
import { Member } from '../entities/Member';

export interface IBorrowingStrategy {
  canBorrow(member: Member, book: Book): boolean;
  getBorrowDuration(): number;
}
