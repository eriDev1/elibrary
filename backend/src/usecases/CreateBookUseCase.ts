import { IUseCase } from '../domain/interfaces/IUseCase';
import { IBookRepository } from '../domain/interfaces/IBookRepository';
import { Book } from '../domain/entities/Book';

export interface CreateBookInput {
  title: string;
  author: string;
  isbn: string;
}

export class CreateBookUseCase implements IUseCase<CreateBookInput, Promise<Book>> {
  constructor(private bookRepository: IBookRepository) {}

  execute(input: CreateBookInput): Promise<Book> {
    const book = new Book(
      crypto.randomUUID(),
      input.title,
      input.author,
      input.isbn
    );
    return this.bookRepository.create(book);
  }
}
