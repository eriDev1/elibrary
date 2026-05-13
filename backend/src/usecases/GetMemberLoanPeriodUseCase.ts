import { IUseCase } from '../domain/interfaces/IUseCase';
import { IMemberRepository } from '../domain/interfaces/IMemberRepository';
import { IBorrowingStrategyResolver } from '../domain/interfaces/IBorrowingStrategyResolver';

export interface GetMemberLoanPeriodInput {
  memberId: string;
}

export interface MemberLoanPeriod {
  member_type: string;
  loan_duration_days: number;
}

export class GetMemberLoanPeriodUseCase
  implements IUseCase<GetMemberLoanPeriodInput, Promise<MemberLoanPeriod | null>>
{
  constructor(
    private memberRepository: IMemberRepository,
    private strategyResolver: IBorrowingStrategyResolver
  ) {}

  async execute(input: GetMemberLoanPeriodInput): Promise<MemberLoanPeriod | null> {
    const member = await this.memberRepository.findById(input.memberId);
    if (!member) {
      return null;
    }
    const strategy = this.strategyResolver.resolve(member);
    return {
      member_type: member.memberType,
      loan_duration_days: strategy.getBorrowDuration(),
    };
  }
}
