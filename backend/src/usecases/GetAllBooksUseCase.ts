import { IUseCase } from '../domain/interfaces/IUseCase';
import { IBookRepository } from '../domain/interfaces/IBookRepository';
import { Book } from '../domain/entities/Book';

export class GetAllBooksUseCase implements IUseCase<void, Promise<Book[]>> {
  constructor(private bookRepository: IBookRepository) {}

  execute(): Promise<Book[]> {
    return this.bookRepository.findAll();
  }
}
