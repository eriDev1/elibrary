import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { BookFilter, IBookRepository } from '../../domain/interfaces/IBookRepository';
import { Book } from '../../domain/entities/Book';

interface BookRow {
  id: string;
  title: string;
  author: string;
  isbn: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

function toBook(row: BookRow): Book {
  return new Book(
    row.id,
    row.title,
    row.author,
    row.isbn,
    row.is_available,
    new Date(row.created_at),
    new Date(row.updated_at)
  );
}

export class SupabaseBookRepository
  extends SupabaseBaseRepository<Book>
  implements IBookRepository
{
  constructor(supabase: SupabaseClient) {
    super(supabase, 'books');
  }

  validate(book: Book): boolean {
    return book.id !== '' && book.title !== '' && book.isbn !== '' && book.author !== '';
  }

  async create(book: Book): Promise<Book> {
    if (!this.validate(book)) {
      throw new Error('Invalid book');
    }
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        is_available: book.isAvailable,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toBook(data as BookRow);
  }

  async findAll(filter: BookFilter = {}): Promise<Book[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (filter.search && filter.search.trim().length > 0) {
      const term = `%${filter.search.trim()}%`;
      query = query.or(`title.ilike.${term},author.ilike.${term},isbn.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data as BookRow[]).map(toBook);
  }

  findById(id: string): Promise<Book | undefined>;
  findById(id: string, title: string): Promise<Book | undefined>;
  async findById(id: string, title?: string): Promise<Book | undefined> {
    let query = this.supabase.from(this.tableName).select('*').eq('id', id);
    if (title) query = query.eq('title', title);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toBook(data as BookRow) : undefined;
  }

  async update(book: Book): Promise<Book> {
    if (!this.validate(book)) {
      throw new Error('Invalid book');
    }
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        is_available: book.isAvailable,
      })
      .eq('id', book.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toBook(data as BookRow);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase.from(this.tableName).delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
}
