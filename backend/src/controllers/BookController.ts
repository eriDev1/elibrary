import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateBookUseCase } from '../usecases/CreateBookUseCase';
import { GetAllBooksUseCase } from '../usecases/GetAllBooksUseCase';
import { UpdateBookUseCase } from '../usecases/UpdateBookUseCase';
import { DeleteBookUseCase } from '../usecases/DeleteBookUseCase';
import { parseBookListQuery } from '../util/parsePagedQuery';

interface BookBody {
  title: string;
  author: string;
  isbn: string;
}

export class BookController {
  constructor(
    private createBookUseCase: CreateBookUseCase,
    private getAllBooksUseCase: GetAllBooksUseCase,
    private updateBookUseCase: UpdateBookUseCase,
    private deleteBookUseCase: DeleteBookUseCase
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as BookBody;
    const book = await this.createBookUseCase.execute(body);
    reply.code(201).send(book.toJSON());
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const q = request.query as Record<string, string | string[] | undefined>;
    const { page, pageSize, search, availableOnly } = parseBookListQuery(q);
    const result = await this.getAllBooksUseCase.execute({
      page,
      pageSize,
      search,
      availableOnly,
    });
    reply.send({
      items: result.items.map((b) => b.toJSON()),
      total: result.total,
    });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as BookBody;
    const book = await this.updateBookUseCase.execute({ id, ...body });
    if (!book) {
      reply.code(404).send({ error: 'Book not found' });
      return;
    }
    reply.send(book.toJSON());
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const ok = await this.deleteBookUseCase.execute({ id });
    if (!ok) {
      reply.code(400).send({ error: 'Cannot delete book' });
      return;
    }
    reply.code(204).send();
  }
}
