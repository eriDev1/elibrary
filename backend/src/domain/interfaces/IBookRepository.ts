import { Book } from '../entities/Book';

export interface IBookRepository {
  create(book: Book): Promise<Book>;
  findById(id: string): Promise<Book | undefined>;
  findAll(): Promise<Book[]>;
  update(book: Book): Promise<Book>;
}
