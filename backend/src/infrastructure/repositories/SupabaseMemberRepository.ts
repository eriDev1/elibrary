import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { IMemberRepository, MemberFilter } from '../../domain/interfaces/IMemberRepository';
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

export class SupabaseMemberRepository
  extends SupabaseBaseRepository<Member>
  implements IMemberRepository
{
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

  async findAll(filter: MemberFilter = {}): Promise<Member[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (filter.search && filter.search.trim().length > 0) {
      const term = `%${filter.search.trim()}%`;
      query = query.or(`name.ilike.${term},email.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data as MemberRow[]).map(toMember);
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
