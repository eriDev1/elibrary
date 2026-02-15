import { IUseCase } from '../domain/interfaces/IUseCase';
import { IBookRepository } from '../domain/interfaces/IBookRepository';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';
import { IBorrowingStrategy } from '../domain/interfaces/IBorrowingStrategy';
import { BorrowRecord } from '../domain/entities/BorrowRecord';

export interface BorrowBookInput {
  bookId: string;
  memberId: string;
}

export class BorrowBookUseCase implements IUseCase<BorrowBookInput, BorrowRecord | null> {
  private records: BorrowRecord[] = [];

  constructor(
    private bookRepository: IBookRepository,
    private memberRepository: IMemberRepository,
    private borrowingStrategy: IBorrowingStrategy
  ) {}

  execute(input: BorrowBookInput): BorrowRecord | null {
    const book = this.bookRepository.findById(input.bookId);
    const member = this.memberRepository.findById(input.memberId);

    if (!book || !member) {
      return null;
    }

    if (!this.borrowingStrategy.canBorrow(member, book)) {
      return null;
    }

    book.isAvailable = false;
    this.bookRepository.update(book);

    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + this.borrowingStrategy.getBorrowDuration());

    const record = new BorrowRecord(
      `BR-${Date.now()}`,
      input.bookId,
      input.memberId,
      borrowDate,
      dueDate
    );

    this.records.push(record);
    return record;
  }
}
