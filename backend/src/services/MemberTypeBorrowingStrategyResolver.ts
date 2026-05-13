import { Member } from '../domain/entities/Member';
import { IBorrowingStrategy } from '../domain/interfaces/IBorrowingStrategy';
import { IBorrowingStrategyResolver } from '../domain/interfaces/IBorrowingStrategyResolver';

export class MemberTypeBorrowingStrategyResolver implements IBorrowingStrategyResolver {
  constructor(
    private readonly standard: IBorrowingStrategy,
    private readonly student: IBorrowingStrategy,
    private readonly premium: IBorrowingStrategy
  ) {}

  resolve(member: Member): IBorrowingStrategy {
    switch (member.memberType) {
      case 'student':
        return this.student;
      case 'premium':
        return this.premium;
      default:
        return this.standard;
    }
  }
}
