import { Book } from '../entities/Book';

export interface IBookRepository {
  create(book: Book): Book;
  findById(id: string): Book | undefined;
  findAll(): Book[];
  update(book: Book): Book;
}
