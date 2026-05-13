import { IUseCase } from '../domain/interfaces/IUseCase';
import {
  IMemberRepository,
  MemberFilter,
} from '../domain/interfaces/IMemberRepository';
import { PagedList } from '../domain/PagedList';
import { Member } from '../domain/entities/Member';

export class GetAllMembersUseCase implements IUseCase<MemberFilter, Promise<PagedList<Member>>> {
  constructor(private memberRepository: IMemberRepository) {}

  execute(filter: MemberFilter): Promise<PagedList<Member>> {
    return this.memberRepository.findAll(filter);
  }
}
