import { FastifyRequest, FastifyReply } from 'fastify';
import { BorrowBookUseCase } from '../usecases/BorrowBookUseCase';
import { ReturnBookUseCase } from '../usecases/ReturnBookUseCase';
import { GetAllBorrowsUseCase } from '../usecases/GetAllBorrowsUseCase';
import { GetMyActiveBorrowsUseCase } from '../usecases/GetMyActiveBorrowsUseCase';
import { GetMemberLoanPeriodUseCase } from '../usecases/GetMemberLoanPeriodUseCase';

export class BorrowController {
  constructor(
    private borrowBookUseCase: BorrowBookUseCase,
    private returnBookUseCase: ReturnBookUseCase,
    private getAllBorrowsUseCase: GetAllBorrowsUseCase,
    private getMyActiveBorrowsUseCase: GetMyActiveBorrowsUseCase,
    private getMemberLoanPeriodUseCase: GetMemberLoanPeriodUseCase
  ) {}

  async borrow(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { bookId: string };
    const record = await this.borrowBookUseCase.execute({
      bookId: body.bookId,
      memberId: request.user.id,
    });

    if (!record) {
      reply.code(400).send({ error: 'Cannot borrow book' });
      return;
    }

    reply.code(201).send(record);
  }

  async return(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { bookId: string };
    const success = await this.returnBookUseCase.execute(body);

    if (!success) {
      reply.code(400).send({ error: 'Cannot return book' });
      return;
    }

    reply.send({ success: true });
  }

  async report(_request: FastifyRequest, reply: FastifyReply) {
    const items = await this.getAllBorrowsUseCase.execute();
    reply.send(items);
  }

  async myActive(request: FastifyRequest, reply: FastifyReply) {
    const items = await this.getMyActiveBorrowsUseCase.execute({
      memberId: request.user.id,
    });
    reply.send(items);
  }

  async memberLoanPeriod(request: FastifyRequest, reply: FastifyReply) {
    const period = await this.getMemberLoanPeriodUseCase.execute({
      memberId: request.user.id,
    });
    if (!period) {
      reply.code(404).send({ error: 'Member not found' });
      return;
    }
    reply.send(period);
  }
}
