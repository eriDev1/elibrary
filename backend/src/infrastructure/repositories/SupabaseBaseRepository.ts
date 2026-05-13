import { SupabaseClient } from '@supabase/supabase-js';

export abstract class SupabaseBaseRepository<T> {
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

  protected async add(item: T): Promise<T> {
    if (!this.validate(item)) {
      throw new Error(`Validation failed for item in ${this.tableName}`);
    }
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as T;
  }
}
