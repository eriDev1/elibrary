import { IUseCase } from '../domain/interfaces/IUseCase';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';
import { Member } from '../domain/entities/Member';

export class GetAllMembersUseCase implements IUseCase<void, Promise<Member[]>> {
  constructor(private memberRepository: IMemberRepository) {}

  execute(): Promise<Member[]> {
    return this.memberRepository.findAll();
  }
}
