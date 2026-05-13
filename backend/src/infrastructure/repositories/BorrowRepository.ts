import { SupabaseClient } from '@supabase/supabase-js';
import {
  BorrowListQuery,
  BorrowReportItem,
  IBorrowRepository,
  MemberActiveBorrow,
  MemberBorrowHistoryEntry,
} from '../../domain/interfaces/IBorrowRepository';
import { PagedList } from '../../domain/PagedList';
import { BorrowRecord } from '../../domain/entities/BorrowRecord';

interface BorrowRow {
  id: string;
  book_id: string;
  member_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
}

interface BorrowReportRow extends BorrowRow {
  books: { title: string; author: string } | null;
  members: { name: string; email: string; member_type: string } | null;
}

interface MemberBorrowRow {
  id: string;
  book_id: string;
  borrow_date: string;
  due_date: string;
  books:
    | { title: string; author: string; isbn: string }
    | { title: string; author: string; isbn: string }[]
    | null;
}

interface MemberBorrowHistoryRow {
  id: string;
  book_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  books:
    | { title: string; author: string; isbn: string }
    | { title: string; author: string; isbn: string }[]
    | null;
}

function singleBook(
  books: MemberBorrowRow['books']
): { title: string; author: string; isbn: string } | null {
  if (!books) return null;
  return Array.isArray(books) ? books[0] ?? null : books;
}

function toBorrowRecord(row: BorrowRow): BorrowRecord {
  return new BorrowRecord(
    row.id,
    row.book_id,
    row.member_id,
    new Date(row.borrow_date),
    new Date(row.due_date),
    row.return_date ? new Date(row.return_date) : undefined
  );
}

function mapReportRow(row: BorrowReportRow): BorrowReportItem {
  return {
    id: row.id,
    book_id: row.book_id,
    book_title: row.books?.title ?? '(deleted)',
    book_author: row.books?.author ?? '',
    member_id: row.member_id,
    member_name: row.members?.name ?? '(deleted)',
    member_email: row.members?.email ?? '',
    member_type: row.members?.member_type ?? '',
    borrow_date: row.borrow_date,
    due_date: row.due_date,
    return_date: row.return_date,
  };
}

export class BorrowRepository implements IBorrowRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(record: BorrowRecord): Promise<BorrowRecord> {
    const { data, error } = await this.supabase
      .from('borrow_records')
      .insert({
        id: record.id,
        book_id: record.bookId,
        member_id: record.memberId,
        borrow_date: record.borrowDate.toISOString(),
        due_date: record.dueDate.toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toBorrowRecord(data as BorrowRow);
  }

  async findActiveByBookId(bookId: string): Promise<BorrowRecord | undefined> {
    const { data, error } = await this.supabase
      .from('borrow_records')
      .select('*')
      .eq('book_id', bookId)
      .is('return_date', null)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toBorrowRecord(data as BorrowRow) : undefined;
  }

  async markReturned(bookId: string, returnDate: Date): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('borrow_records')
      .update({ return_date: returnDate.toISOString() })
      .eq('book_id', bookId)
      .is('return_date', null)
      .select('id');
    if (error) throw new Error(error.message);
    return (data?.length ?? 0) > 0;
  }

  async findAllWithDetails(query: BorrowListQuery): Promise<PagedList<BorrowReportItem>> {
    const page = query.page;
    const pageSize = query.pageSize;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await this.supabase
      .from('borrow_records')
      .select('*, books(title, author), members(name, email, member_type)', { count: 'exact' })
      .order('borrow_date', { ascending: false })
      .range(from, to);
    if (error) throw new Error(error.message);

    const items = (data as BorrowReportRow[]).map(mapReportRow);
    const total = count ?? items.length;
    return { items, total };
  }

  async findActiveBorrowsForMember(
    memberId: string,
    query: BorrowListQuery
  ): Promise<PagedList<MemberActiveBorrow>> {
    const page = query.page;
    const pageSize = query.pageSize;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await this.supabase
      .from('borrow_records')
      .select('id, book_id, borrow_date, due_date, books(title, author, isbn)', { count: 'exact' })
      .eq('member_id', memberId)
      .is('return_date', null)
      .order('due_date', { ascending: true })
      .range(from, to);
    if (error) throw new Error(error.message);

    const items = (data as MemberBorrowRow[]).map((row) => {
      const b = singleBook(row.books);
      return {
        id: row.id,
        book_id: row.book_id,
        book_title: b?.title ?? '(deleted)',
        book_author: b?.author ?? '',
        book_isbn: b?.isbn ?? '',
        borrow_date: row.borrow_date,
        due_date: row.due_date,
      };
    });
    const total = count ?? items.length;
    return { items, total };
  }

  async findBorrowHistoryForMember(
    memberId: string,
    query: BorrowListQuery
  ): Promise<PagedList<MemberBorrowHistoryEntry>> {
    const page = query.page;
    const pageSize = query.pageSize;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await this.supabase
      .from('borrow_records')
      .select('id, book_id, borrow_date, due_date, return_date, books(title, author, isbn)', {
        count: 'exact',
      })
      .eq('member_id', memberId)
      .order('borrow_date', { ascending: false })
      .range(from, to);
    if (error) throw new Error(error.message);

    const items = (data as MemberBorrowHistoryRow[]).map((row) => {
      const b = singleBook(row.books);
      return {
        id: row.id,
        book_id: row.book_id,
        book_title: b?.title ?? '(deleted)',
        book_author: b?.author ?? '',
        book_isbn: b?.isbn ?? '',
        borrow_date: row.borrow_date,
        due_date: row.due_date,
        return_date: row.return_date,
      };
    });
    const total = count ?? items.length;
    return { items, total };
  }
}
