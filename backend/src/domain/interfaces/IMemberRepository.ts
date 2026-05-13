import { Member } from '../entities/Member';
import { PagedList } from '../PagedList';

export interface MemberFilter {
  search?: string;
  page: number;
  pageSize: number;
}

export interface IMemberRepository {
  create(member: Member): Promise<Member>;
  findById(id: string): Promise<Member | undefined>;
  findAll(filter: MemberFilter): Promise<PagedList<Member>>;
  update(member: Member): Promise<Member>;
  delete(id: string): Promise<boolean>;
}
