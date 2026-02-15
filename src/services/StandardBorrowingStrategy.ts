import { IBorrowingStrategy } from '../domain/interfaces/IBorrowingStrategy';
import { Book } from '../domain/entities/Book';
import { Member } from '../domain/entities/Member';

export class StandardBorrowingStrategy implements IBorrowingStrategy {
  canBorrow(member: Member, book: Book): boolean {
    return book.isAvailable;
  }

  getBorrowDuration(): number {
    return 14;
  }
}
