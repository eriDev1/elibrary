import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseBaseRepository } from './SupabaseBaseRepository';
import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import { Member } from '../../domain/entities/Member';

interface MemberRow {
  id: string;
  name: string;
  email: string;
  member_type: string;
}

function toMember(row: MemberRow): Member {
  return new Member(row.id, row.name, row.email, row.member_type);
}

function toRow(member: Member): MemberRow {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    member_type: member.memberType,
  };
}

export class SupabaseMemberRepository
  extends SupabaseBaseRepository<Member>
  implements IMemberRepository
{
  constructor(supabase: SupabaseClient) {
    super(supabase, 'members');
  }

  validate(member: Member): boolean {
    return member.id !== '' && member.email !== '' && member.name !== '';
  }

  async create(member: Member): Promise<Member> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(toRow(member))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toMember(data as MemberRow);
  }

  async findAll(): Promise<Member[]> {
    const rows = await this.getAll();
    return (rows as unknown as MemberRow[]).map(toMember);
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
}
