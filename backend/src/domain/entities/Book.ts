export class Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    title: string,
    author: string,
    isbn: string,
    isAvailable = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.isbn = isbn;
    this.isAvailable = isAvailable;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      isbn: this.isbn,
      is_available: this.isAvailable,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
