import Fastify from 'fastify';
import { BookService } from './services/BookService';
import { MemberService } from './services/MemberService';
import { StandardBorrowingStrategy } from './services/StandardBorrowingStrategy';
import { CreateBookUseCase } from './usecases/CreateBookUseCase';
import { GetAllBooksUseCase } from './usecases/GetAllBooksUseCase';
import { CreateMemberUseCase } from './usecases/CreateMemberUseCase';
import { GetAllMembersUseCase } from './usecases/GetAllMembersUseCase';
import { BorrowBookUseCase } from './usecases/BorrowBookUseCase';
import { ReturnBookUseCase } from './usecases/ReturnBookUseCase';
import { BookController } from './controllers/BookController';
import { MemberController } from './controllers/MemberController';
import { BorrowController } from './controllers/BorrowController';

const fastify = Fastify();

const bookService = new BookService();
const memberService = new MemberService();
const borrowingStrategy = new StandardBorrowingStrategy();

const createBookUseCase = new CreateBookUseCase(bookService);
const getAllBooksUseCase = new GetAllBooksUseCase(bookService);
const createMemberUseCase = new CreateMemberUseCase(memberService);
const getAllMembersUseCase = new GetAllMembersUseCase(memberService);
const borrowBookUseCase = new BorrowBookUseCase(bookService, memberService, borrowingStrategy);
const returnBookUseCase = new ReturnBookUseCase(bookService);

const bookController = new BookController(createBookUseCase, getAllBooksUseCase);
const memberController = new MemberController(createMemberUseCase, getAllMembersUseCase);
const borrowController = new BorrowController(borrowBookUseCase, returnBookUseCase);

fastify.post('/books', (request, reply) => bookController.create(request, reply));
fastify.get('/books', (request, reply) => bookController.getAll(request, reply));

fastify.post('/members', (request, reply) => memberController.create(request, reply));
fastify.get('/members', (request, reply) => memberController.getAll(request, reply));

fastify.post('/borrow', (request, reply) => borrowController.borrow(request, reply));
fastify.post('/return', (request, reply) => borrowController.return(request, reply));

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
