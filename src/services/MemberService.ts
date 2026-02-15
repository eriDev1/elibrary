import { Member } from '../domain/entities/Member';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';
import { BaseLibraryService } from '../domain/abstract/BaseLibraryService';

export class MemberService extends BaseLibraryService<Member> implements IMemberRepository {
  validate(member: Member): boolean {
    return member.id !== '' && member.email !== '';
  }

  create(member: Member): Member {
    return this.add(member);
  }

  findById(id: string): Member | undefined {
    return this.items.find(m => m.id === id);
  }

  findAll(): Member[] {
    return this.getAll();
  }
}
