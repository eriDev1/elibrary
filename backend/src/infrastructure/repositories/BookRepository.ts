import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './BaseRepository';
import { BookFilter, IBookRepository } from '../../domain/interfaces/IBookRepository';
import { PagedList } from '../../domain/PagedList';
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

export class BookRepository extends BaseRepository<Book> implements IBookRepository {
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

  async findAll(filter: BookFilter): Promise<PagedList<Book>> {
    const page = filter.page;
    const pageSize = filter.pageSize;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filter.search && filter.search.trim().length > 0) {
      const term = `%${filter.search.trim()}%`;
      query = query.or(`title.ilike.${term},author.ilike.${term},isbn.ilike.${term}`);
    }

    if (filter.availableOnly) {
      query = query.eq('is_available', true);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(error.message);
    const items = (data as BookRow[]).map(toBook);
    const total = count ?? items.length;
    return { items, total };
  }

  findById(id: string): Promise<Book | undefined>;
  findById(id: string, title: string): Promise<Book | undefined>;
  async findById(id: string, title?: string): Promise<Book | undefined> {
    let q = this.supabase.from(this.tableName).select('*').eq('id', id);
    if (title) q = q.eq('title', title);
    const { data, error } = await q.maybeSingle();
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
