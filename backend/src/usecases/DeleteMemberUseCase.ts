import { IUseCase } from '../domain/interfaces/IUseCase';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';

export interface DeleteMemberInput {
  id: string;
}

export class DeleteMemberUseCase implements IUseCase<DeleteMemberInput, Promise<boolean>> {
  constructor(private memberRepository: IMemberRepository) {}

  execute(input: DeleteMemberInput): Promise<boolean> {
    return this.memberRepository.delete(input.id);
  }
}
