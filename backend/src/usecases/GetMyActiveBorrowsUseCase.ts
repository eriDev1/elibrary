import { IUseCase } from '../domain/interfaces/IUseCase';
import {
  IBorrowRepository,
  MemberActiveBorrow,
} from '../domain/interfaces/IBorrowRepository';

export interface GetMyActiveBorrowsInput {
  memberId: string;
}

export class GetMyActiveBorrowsUseCase
  implements IUseCase<GetMyActiveBorrowsInput, Promise<MemberActiveBorrow[]>>
{
  constructor(private borrowRepository: IBorrowRepository) {}

  execute(input: GetMyActiveBorrowsInput): Promise<MemberActiveBorrow[]> {
    return this.borrowRepository.findActiveBorrowsForMember(input.memberId);
  }
}
