import { Member } from '../entities/Member';

export interface IMemberRepository {
  create(member: Member): Promise<Member>;
  findById(id: string): Promise<Member | undefined>;
  findAll(): Promise<Member[]>;
}
