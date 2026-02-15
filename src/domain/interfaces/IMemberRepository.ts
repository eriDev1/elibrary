import { Member } from '../entities/Member';

export interface IMemberRepository {
  create(member: Member): Member;
  findById(id: string): Member | undefined;
  findAll(): Member[];
}
