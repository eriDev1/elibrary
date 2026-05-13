import { IUseCase } from '../domain/interfaces/IUseCase';
import {
  BorrowReportItem,
  IBorrowRepository,
} from '../domain/interfaces/IBorrowRepository';

export class GetAllBorrowsUseCase implements IUseCase<void, Promise<BorrowReportItem[]>> {
  constructor(private borrowRepository: IBorrowRepository) {}

  execute(): Promise<BorrowReportItem[]> {
    return this.borrowRepository.findAllWithDetails();
  }
}
