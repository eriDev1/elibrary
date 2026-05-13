import { IUseCase } from '../domain/interfaces/IUseCase';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';
import { Member } from '../domain/entities/Member';

export interface CreateMemberInput {
  id?: string;
  name: string;
  email: string;
  memberType: string;
}

export class CreateMemberUseCase implements IUseCase<CreateMemberInput, Promise<Member>> {
  constructor(private memberRepository: IMemberRepository) {}

  execute(input: CreateMemberInput): Promise<Member> {
    const member = new Member(
      input.id ?? crypto.randomUUID(),
      input.name,
      input.email,
      input.memberType
    );
    return this.memberRepository.create(member);
  }
}
