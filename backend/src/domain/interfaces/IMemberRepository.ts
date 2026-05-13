import { Member } from '../entities/Member';

export interface MemberFilter {
  search?: string;
}

export interface IMemberRepository {
  create(member: Member): Promise<Member>;
  findById(id: string): Promise<Member | undefined>;
  findAll(filter?: MemberFilter): Promise<Member[]>;
  update(member: Member): Promise<Member>;
  delete(id: string): Promise<boolean>;
}
