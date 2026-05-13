import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './BaseRepository';
import { IMemberRepository, MemberFilter } from '../../domain/interfaces/IMemberRepository';
import { PagedList } from '../../domain/PagedList';
import { Member, MemberType } from '../../domain/entities/Member';

interface MemberRow {
  id: string;
  name: string;
  email: string;
  member_type: MemberType;
  created_at: string;
  updated_at: string;
}

function toMember(row: MemberRow): Member {
  return new Member(
    row.id,
    row.name,
    row.email,
    row.member_type,
    new Date(row.created_at),
    new Date(row.updated_at)
  );
}

export class MemberRepository extends BaseRepository<Member> implements IMemberRepository {
  constructor(supabase: SupabaseClient) {
    super(supabase, 'members');
  }

  validate(member: Member): boolean {
    return (
      member.id !== '' &&
      member.email !== '' &&
      member.name !== '' &&
      ['standard', 'student', 'premium'].includes(member.memberType)
    );
  }

  async create(member: Member): Promise<Member> {
    if (!this.validate(member)) {
      throw new Error('Invalid member');
    }
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        id: member.id,
        name: member.name,
        email: member.email,
        member_type: member.memberType,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toMember(data as MemberRow);
  }

  async findAll(filter: MemberFilter): Promise<PagedList<Member>> {
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
      query = query.or(`name.ilike.${term},email.ilike.${term}`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(error.message);
    const items = (data as MemberRow[]).map(toMember);
    const total = count ?? items.length;
    return { items, total };
  }

  async findById(id: string): Promise<Member | undefined> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toMember(data as MemberRow) : undefined;
  }

  async update(member: Member): Promise<Member> {
    if (!this.validate(member)) {
      throw new Error('Invalid member');
    }
    const { data, error } = await this.supabase
      .from(this.tableName)
      .update({
        name: member.name,
        email: member.email,
        member_type: member.memberType,
      })
      .eq('id', member.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toMember(data as MemberRow);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase.from(this.tableName).delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
}
