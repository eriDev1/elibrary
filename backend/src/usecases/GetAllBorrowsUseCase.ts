import { IUseCase } from '../domain/interfaces/IUseCase';
import {
  BorrowListQuery,
  BorrowReportItem,
  IBorrowRepository,
} from '../domain/interfaces/IBorrowRepository';
import { PagedList } from '../domain/PagedList';

export class GetAllBorrowsUseCase
  implements IUseCase<BorrowListQuery, Promise<PagedList<BorrowReportItem>>>
{
  constructor(private borrowRepository: IBorrowRepository) {}

  execute(query: BorrowListQuery): Promise<PagedList<BorrowReportItem>> {
    return this.borrowRepository.findAllWithDetails(query);
  }
}
