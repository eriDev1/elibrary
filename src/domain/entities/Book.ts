export class Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  isAvailable: boolean;

  constructor(id: string, title: string, author: string, isbn: string) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.isAvailable = true;
  }
}
