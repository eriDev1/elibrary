import { IUseCase } from '../domain/interfaces/IUseCase';
import {
  BorrowListQuery,
  IBorrowRepository,
  MemberActiveBorrow,
} from '../domain/interfaces/IBorrowRepository';
import { PagedList } from '../domain/PagedList';

export interface GetMyActiveBorrowsInput {
  memberId: string;
  page: number;
  pageSize: number;
}

export class GetMyActiveBorrowsUseCase
  implements IUseCase<GetMyActiveBorrowsInput, Promise<PagedList<MemberActiveBorrow>>>
{
  constructor(private borrowRepository: IBorrowRepository) {}

  execute(input: GetMyActiveBorrowsInput): Promise<PagedList<MemberActiveBorrow>> {
    const query: BorrowListQuery = { page: input.page, pageSize: input.pageSize };
    return this.borrowRepository.findActiveBorrowsForMember(input.memberId, query);
  }
}
