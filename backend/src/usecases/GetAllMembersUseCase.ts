import { IUseCase } from '../domain/interfaces/IUseCase';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';
import { Member } from '../domain/entities/Member';

export class GetAllMembersUseCase implements IUseCase<void, Member[]> {
  constructor(private memberRepository: IMemberRepository) {}

  execute(): Member[] {
    return this.memberRepository.findAll();
  }
}
