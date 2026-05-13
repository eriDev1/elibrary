import { SupabaseClient } from '@supabase/supabase-js';
import { IBorrowRepository } from '../../domain/interfaces/IBorrowRepository';
import { BorrowRecord } from '../../domain/entities/BorrowRecord';

interface BorrowRow {
  id: string;
  book_id: string;
  member_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
}

function toBorrowRecord(row: BorrowRow): BorrowRecord {
  const record = new BorrowRecord(
    row.id,
    row.book_id,
    row.member_id,
    new Date(row.borrow_date),
    new Date(row.due_date)
  );
  if (row.return_date) {
    record.returnDate = new Date(row.return_date);
  }
  return record;
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
    const { error } = await this.supabase
      .from('borrow_records')
      .update({ return_date: returnDate.toISOString() })
      .eq('book_id', bookId)
      .is('return_date', null);
    if (error) throw new Error(error.message);
    return true;
  }
}
