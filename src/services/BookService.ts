import { Book } from '../domain/entities/Book';
import { IBookRepository } from '../domain/interfaces/IBookRepository';
import { BaseLibraryService } from '../domain/abstract/BaseLibraryService';

export class BookService extends BaseLibraryService<Book> implements IBookRepository {
  validate(book: Book): boolean {
    return book.id !== '' && book.title !== '';
  }

  create(book: Book): Book {
    return this.add(book);
  }

  findById(id: string): Book | undefined;
  findById(id: string, title: string): Book | undefined;
  findById(id: string, title?: string): Book | undefined {
    if (title) {
      return this.items.find(b => b.id === id && b.title === title);
    }
    return this.items.find(b => b.id === id);
  }

  findAll(): Book[] {
    return this.getAll();
  }

  update(book: Book): Book {
    const index = this.items.findIndex(b => b.id === book.id);
    if (index !== -1) {
      this.items[index] = book;
    }
    return book;
  }
}
