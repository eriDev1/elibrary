import { IUseCase } from '../domain/interfaces/IUseCase';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';
import {
  IBorrowRepository,
  MemberBorrowHistoryEntry,
} from '../domain/interfaces/IBorrowRepository';
import { PagedList } from '../domain/PagedList';

export interface GetMemberBorrowHistoryInput {
  memberId: string;
  page: number;
  pageSize: number;
}

export class GetMemberBorrowHistoryUseCase
  implements IUseCase<GetMemberBorrowHistoryInput, Promise<PagedList<MemberBorrowHistoryEntry> | null>>
{
  constructor(
    private memberRepository: IMemberRepository,
    private borrowRepository: IBorrowRepository
  ) {}

  async execute(
    input: GetMemberBorrowHistoryInput
  ): Promise<PagedList<MemberBorrowHistoryEntry> | null> {
    const member = await this.memberRepository.findById(input.memberId);
    if (!member) {
      return null;
    }
    return this.borrowRepository.findBorrowHistoryForMember(input.memberId, {
      page: input.page,
      pageSize: input.pageSize,
    });
  }
}
