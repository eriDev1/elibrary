import { IUseCase } from '../domain/interfaces/IUseCase';
import { BookFilter, IBookRepository } from '../domain/interfaces/IBookRepository';
import { Book } from '../domain/entities/Book';

export class GetAllBooksUseCase implements IUseCase<BookFilter, Promise<Book[]>> {
  constructor(private bookRepository: IBookRepository) {}

  execute(filter: BookFilter = {}): Promise<Book[]> {
    return this.bookRepository.findAll(filter);
  }
}
