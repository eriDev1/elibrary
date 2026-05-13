import { Member } from '../entities/Member';
import { IBorrowingStrategy } from './IBorrowingStrategy';

export interface IBorrowingStrategyResolver {
  resolve(member: Member): IBorrowingStrategy;
}
