import { SupabaseClient } from '@supabase/supabase-js';
import {
  BorrowReportItem,
  IBorrowRepository,
} from '../../domain/interfaces/IBorrowRepository';
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

export class SupabaseBorrowRepository implements IBorrowRepository {
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

  async findAllWithDetails(): Promise<BorrowReportItem[]> {
    const { data, error } = await this.supabase
      .from('borrow_records')
      .select('*, books(title, author), members(name, email, member_type)')
      .order('borrow_date', { ascending: false });
    if (error) throw new Error(error.message);

    return (data as BorrowReportRow[]).map((row) => ({
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
    }));
  }
}
