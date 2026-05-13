import { IUseCase } from '../domain/interfaces/IUseCase';
import {
  BorrowListQuery,
  IBorrowRepository,
  MemberBorrowHistoryEntry,
} from '../domain/interfaces/IBorrowRepository';
import { PagedList } from '../domain/PagedList';

export interface GetMyBorrowHistoryInput {
  memberId: string;
  page: number;
  pageSize: number;
}

export class GetMyBorrowHistoryUseCase
  implements IUseCase<GetMyBorrowHistoryInput, Promise<PagedList<MemberBorrowHistoryEntry>>>
{
  constructor(private borrowRepository: IBorrowRepository) {}

  execute(input: GetMyBorrowHistoryInput): Promise<PagedList<MemberBorrowHistoryEntry>> {
    const query: BorrowListQuery = { page: input.page, pageSize: input.pageSize };
    return this.borrowRepository.findBorrowHistoryForMember(input.memberId, query);
  }
}
