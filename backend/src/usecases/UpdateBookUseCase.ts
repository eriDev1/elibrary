import { IUseCase } from '../domain/interfaces/IUseCase';
import { IBookRepository } from '../domain/interfaces/IBookRepository';
import { Book } from '../domain/entities/Book';

export interface UpdateBookInput {
  id: string;
  title: string;
  author: string;
  isbn: string;
}

export class UpdateBookUseCase implements IUseCase<UpdateBookInput, Promise<Book | null>> {
  constructor(private bookRepository: IBookRepository) {}

  async execute(input: UpdateBookInput): Promise<Book | null> {
    const existing = await this.bookRepository.findById(input.id);
    if (!existing) return null;

    existing.title = input.title;
    existing.author = input.author;
    existing.isbn = input.isbn;

    return this.bookRepository.update(existing);
  }
}
