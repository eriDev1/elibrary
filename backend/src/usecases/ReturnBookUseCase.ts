import { IUseCase } from '../domain/interfaces/IUseCase';
import { IBookRepository } from '../domain/interfaces/IBookRepository';
import { IBorrowRepository } from '../domain/interfaces/IBorrowRepository';

export interface ReturnBookInput {
  bookId: string;
}

export class ReturnBookUseCase implements IUseCase<ReturnBookInput, Promise<boolean>> {
  constructor(
    private bookRepository: IBookRepository,
    private borrowRepository: IBorrowRepository
  ) {}

  async execute(input: ReturnBookInput): Promise<boolean> {
    const book = await this.bookRepository.findById(input.bookId);
    if (!book) return false;

    const wasMarked = await this.borrowRepository.markReturned(input.bookId, new Date());
    if (!wasMarked && book.isAvailable) {
      return false;
    }

    book.isAvailable = true;
    await this.bookRepository.update(book);
    return true;
  }
}
