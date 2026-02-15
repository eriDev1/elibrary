import { IBorrowingStrategy } from '../domain/interfaces/IBorrowingStrategy';
import { Book } from '../domain/entities/Book';
import { Member } from '../domain/entities/Member';

export class PremiumBorrowingStrategy implements IBorrowingStrategy {
  canBorrow(member: Member, book: Book): boolean {
    return book.isAvailable && member.memberType === 'premium';
  }

  getBorrowDuration(): number {
    return 30;
  }
}
