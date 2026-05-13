import { IUseCase } from '../domain/interfaces/IUseCase';
import { IBookRepository } from '../domain/interfaces/IBookRepository';
import { Book } from '../domain/entities/Book';

export interface CreateBookInput {
  title: string;
  author: string;
  isbn: string;
}

export class CreateBookUseCase implements IUseCase<CreateBookInput, Book> {
  constructor(private bookRepository: IBookRepository) {}

  execute(input: CreateBookInput): Book {
    const book = new Book(
      `B-${Date.now()}`,
      input.title,
      input.author,
      input.isbn
    );

    return this.bookRepository.create(book);
  }
}
