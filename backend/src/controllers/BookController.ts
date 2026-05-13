import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateBookUseCase } from '../usecases/CreateBookUseCase';
import { GetAllBooksUseCase } from '../usecases/GetAllBooksUseCase';
import { UpdateBookUseCase } from '../usecases/UpdateBookUseCase';
import { DeleteBookUseCase } from '../usecases/DeleteBookUseCase';

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
    reply.code(201).send(book);
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { search?: string };
    const books = await this.getAllBooksUseCase.execute({ search: query.search });
    reply.send(books);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as BookBody;
    const book = await this.updateBookUseCase.execute({ id, ...body });
    if (!book) {
      reply.code(404).send({ error: 'Book not found' });
      return;
    }
    reply.send(book);
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
