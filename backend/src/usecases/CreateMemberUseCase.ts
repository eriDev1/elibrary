import { IUseCase } from '../domain/interfaces/IUseCase';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';
import { Member } from '../domain/entities/Member';

export interface CreateMemberInput {
  name: string;
  email: string;
  memberType: string;
}

export class CreateMemberUseCase implements IUseCase<CreateMemberInput, Member> {
  constructor(private memberRepository: IMemberRepository) {}

  execute(input: CreateMemberInput): Member {
    const member = new Member(
      `M-${Date.now()}`,
      input.name,
      input.email,
      input.memberType
    );

    return this.memberRepository.create(member);
  }
}
