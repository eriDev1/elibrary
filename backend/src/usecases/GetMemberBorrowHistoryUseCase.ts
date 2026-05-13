import { IUseCase } from '../domain/interfaces/IUseCase';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';
import {
  IBorrowRepository,
  MemberBorrowHistoryEntry,
} from '../domain/interfaces/IBorrowRepository';

export interface GetMemberBorrowHistoryInput {
  memberId: string;
}

export class GetMemberBorrowHistoryUseCase
  implements IUseCase<GetMemberBorrowHistoryInput, Promise<MemberBorrowHistoryEntry[] | null>>
{
  constructor(
    private memberRepository: IMemberRepository,
    private borrowRepository: IBorrowRepository
  ) {}

  async execute(
    input: GetMemberBorrowHistoryInput
  ): Promise<MemberBorrowHistoryEntry[] | null> {
    const member = await this.memberRepository.findById(input.memberId);
    if (!member) {
      return null;
    }
    return this.borrowRepository.findBorrowHistoryForMember(input.memberId);
  }
}
