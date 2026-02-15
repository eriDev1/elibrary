import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateBookUseCase } from '../usecases/CreateBookUseCase';
import { GetAllBooksUseCase } from '../usecases/GetAllBooksUseCase';

export class BookController {
  constructor(
    private createBookUseCase: CreateBookUseCase,
    private getAllBooksUseCase: GetAllBooksUseCase
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { title: string; author: string; isbn: string };
    const book = this.createBookUseCase.execute(body);
    reply.code(201).send(book);
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const books = this.getAllBooksUseCase.execute();
    reply.send(books);
  }
}
