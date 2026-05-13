import { IUseCase } from '../domain/interfaces/IUseCase';
import { IBookRepository } from '../domain/interfaces/IBookRepository';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';
import { IBorrowRepository } from '../domain/interfaces/IBorrowRepository';
import { IBorrowingStrategyResolver } from '../domain/interfaces/IBorrowingStrategyResolver';
import { BorrowRecord } from '../domain/entities/BorrowRecord';

export interface BorrowBookInput {
  bookId: string;
  memberId: string;
}

export class BorrowBookUseCase implements IUseCase<BorrowBookInput, Promise<BorrowRecord | null>> {
  constructor(
    private bookRepository: IBookRepository,
    private memberRepository: IMemberRepository,
    private borrowRepository: IBorrowRepository,
    private strategyResolver: IBorrowingStrategyResolver
  ) {}

  async execute(input: BorrowBookInput): Promise<BorrowRecord | null> {
    const book = await this.bookRepository.findById(input.bookId);
    const member = await this.memberRepository.findById(input.memberId);

    if (!book || !member) {
      return null;
    }

    const strategy = this.strategyResolver.resolve(member);

    if (!strategy.canBorrow(member, book)) {
      return null;
    }

    book.isAvailable = false;
    await this.bookRepository.update(book);

    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + strategy.getBorrowDuration());

    const record = new BorrowRecord(
      crypto.randomUUID(),
      input.bookId,
      input.memberId,
      borrowDate,
      dueDate
    );

    return this.borrowRepository.create(record);
  }
}
