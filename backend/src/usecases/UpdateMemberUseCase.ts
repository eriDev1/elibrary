import { IUseCase } from '../domain/interfaces/IUseCase';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';
import { Member, MemberType } from '../domain/entities/Member';

export interface UpdateMemberInput {
  id: string;
  name: string;
  email: string;
  memberType: MemberType;
}

export class UpdateMemberUseCase implements IUseCase<UpdateMemberInput, Promise<Member | null>> {
  constructor(private memberRepository: IMemberRepository) {}

  async execute(input: UpdateMemberInput): Promise<Member | null> {
    const existing = await this.memberRepository.findById(input.id);
    if (!existing) return null;

    existing.name = input.name;
    existing.email = input.email;
    existing.memberType = input.memberType;

    return this.memberRepository.update(existing);
  }
}
