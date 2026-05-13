import { IUseCase } from '../domain/interfaces/IUseCase';
import { IBookRepository } from '../domain/interfaces/IBookRepository';
import { BorrowRecord } from '../domain/entities/BorrowRecord';

export interface ReturnBookInput {
  bookId: string;
}

export class ReturnBookUseCase implements IUseCase<ReturnBookInput, boolean> {
  constructor(private bookRepository: IBookRepository) {}

  execute(input: ReturnBookInput): boolean {
    const book = this.bookRepository.findById(input.bookId);

    if (!book) {
      return false;
    }

    book.isAvailable = true;
    this.bookRepository.update(book);

    return true;
  }
}
