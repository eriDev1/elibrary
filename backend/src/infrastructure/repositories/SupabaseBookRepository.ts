import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { IBookRepository } from '../../domain/interfaces/IBookRepository';
import { Book } from '../../domain/entities/Book';

interface BookRow {
  id: string;
  title: string;
  author: string;
  isbn: string;
  is_available: boolean;
}

function toBook(row: BookRow): Book {
  const book = new Book(row.id, row.title, row.author, row.isbn);
  book.isAvailable = row.is_available;
  return book;
}

function toRow(book: Book): BookRow {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    is_available: book.isAvailable,
  };
}

export class SupabaseBookRepository
  extends SupabaseBaseRepository<Book>
  implements IBookRepository
{
  constructor(supabase: SupabaseClient) {
    super(supabase, 'books');
  }

  validate(book: Book): boolean {
    return book.id !== '' && book.title !== '' && book.isbn !== '';
  }

  async create(book: Book): Promise<Book> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(toRow(book))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toBook(data as BookRow);
  }

  async findAll(): Promise<Book[]> {
    const rows = await this.getAll();
    return (rows as unknown as BookRow[]).map(toBook);
  }

  findById(id: string): Promise<Book | undefined>;
  findById(id: string, title: string): Promise<Book | undefined>;
  async findById(id: string, title?: string): Promise<Book | undefined> {
    let query = this.supabase.from(this.tableName).select('*').eq('id', id);
    if (title) {
      query = query.eq('title', title);
    }
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toBook(data as BookRow) : undefined;
  }

  async update(book: Book): Promise<Book> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({ is_available: book.isAvailable })
      .eq('id', book.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toBook(data as BookRow);
  }
}
