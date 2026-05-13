import { SupabaseClient } from '@supabase/supabase-js';

export abstract class BaseRepository<T> {
  constructor(
    protected readonly supabase: SupabaseClient,
    protected readonly tableName: string
  ) {}

  abstract validate(item: T): boolean;

  protected async getAll(): Promise<T[]> {
    const { data, error } = await this.supabase.from(this.tableName).select('*');
    if (error) throw new Error(error.message);
    return (data as T[]) ?? [];
  }
}
