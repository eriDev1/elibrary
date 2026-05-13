import { Book } from '../entities/Book';
import { PagedList } from '../PagedList';

export interface BookFilter {
  search?: string;
  page: number;
  pageSize: number;
  availableOnly?: boolean;
}

export interface IBookRepository {
  create(book: Book): Promise<Book>;
  findById(id: string): Promise<Book | undefined>;
  findAll(filter: BookFilter): Promise<PagedList<Book>>;
  update(book: Book): Promise<Book>;
  delete(id: string): Promise<boolean>;
}
