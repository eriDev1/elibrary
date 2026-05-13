import { IUseCase } from '../domain/interfaces/IUseCase';
import { BookFilter, IBookRepository } from '../domain/interfaces/IBookRepository';
import { PagedList } from '../domain/PagedList';
import { Book } from '../domain/entities/Book';

export class GetAllBooksUseCase implements IUseCase<BookFilter, Promise<PagedList<Book>>> {
  constructor(private bookRepository: IBookRepository) {}

  execute(filter: BookFilter): Promise<PagedList<Book>> {
    return this.bookRepository.findAll(filter);
  }
}
