import { IUseCase } from '../domain/interfaces/IUseCase';
import {
  IMemberRepository,
  MemberFilter,
} from '../domain/interfaces/IMemberRepository';
import { Member } from '../domain/entities/Member';

export class GetAllMembersUseCase implements IUseCase<MemberFilter, Promise<Member[]>> {
  constructor(private memberRepository: IMemberRepository) {}

  execute(filter: MemberFilter = {}): Promise<Member[]> {
    return this.memberRepository.findAll(filter);
  }
}
