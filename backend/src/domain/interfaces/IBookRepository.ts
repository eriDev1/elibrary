import { Book } from '../entities/Book';

export interface BookFilter {
  search?: string;
}

export interface IBookRepository {
  create(book: Book): Promise<Book>;
  findById(id: string): Promise<Book | undefined>;
  findAll(filter?: BookFilter): Promise<Book[]>;
  update(book: Book): Promise<Book>;
  delete(id: string): Promise<boolean>;
}
