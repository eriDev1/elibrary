import { IBorrowingStrategy } from '../domain/interfaces/IBorrowingStrategy';
import { Book } from '../domain/entities/Book';
import { Member } from '../domain/entities/Member';

export class StudentBorrowingStrategy implements IBorrowingStrategy {
  canBorrow(member: Member, book: Book): boolean {
    return book.isAvailable && member.memberType === 'student';
  }

  getBorrowDuration(): number {
    return 21;
  }
}
