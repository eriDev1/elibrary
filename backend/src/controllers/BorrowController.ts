import { FastifyRequest, FastifyReply } from 'fastify';
import { BorrowBookUseCase } from '../usecases/BorrowBookUseCase';
import { ReturnBookUseCase } from '../usecases/ReturnBookUseCase';

export class BorrowController {
  constructor(
    private borrowBookUseCase: BorrowBookUseCase,
    private returnBookUseCase: ReturnBookUseCase
  ) {}

  async borrow(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { bookId: string; memberId: string };
    const record = this.borrowBookUseCase.execute(body);

    if (!record) {
      reply.code(400).send({ error: 'Cannot borrow book' });
      return;
    }

    reply.code(201).send(record);
  }

  async return(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { bookId: string };
    const success = this.returnBookUseCase.execute(body);

    if (!success) {
      reply.code(400).send({ error: 'Cannot return book' });
      return;
    }

    reply.send({ success: true });
  }
}
