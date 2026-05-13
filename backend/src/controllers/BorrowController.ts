import { FastifyRequest, FastifyReply } from 'fastify';
import { BorrowBookUseCase } from '../usecases/BorrowBookUseCase';
import { ReturnBookUseCase } from '../usecases/ReturnBookUseCase';
import { GetAllBorrowsUseCase } from '../usecases/GetAllBorrowsUseCase';
import { GetMyActiveBorrowsUseCase } from '../usecases/GetMyActiveBorrowsUseCase';
import { GetMemberLoanPeriodUseCase } from '../usecases/GetMemberLoanPeriodUseCase';
import { parsePagedQuery } from '../util/parsePagedQuery';

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

    reply.code(201).send(record.toJSON());
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

  async report(request: FastifyRequest, reply: FastifyReply) {
    const q = request.query as Record<string, string | string[] | undefined>;
    const { page, pageSize } = parsePagedQuery(q);
    const result = await this.getAllBorrowsUseCase.execute({ page, pageSize });
    reply.send({ items: result.items, total: result.total });
  }

  async myActive(request: FastifyRequest, reply: FastifyReply) {
    const q = request.query as Record<string, string | string[] | undefined>;
    const { page, pageSize } = parsePagedQuery(q);
    const result = await this.getMyActiveBorrowsUseCase.execute({
      memberId: request.user.id,
      page,
      pageSize,
    });
    reply.send({ items: result.items, total: result.total });
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
