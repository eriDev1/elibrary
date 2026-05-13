import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';

import { getSupabaseClient } from './infrastructure/supabase/supabaseClient';
import { SupabaseBookRepository } from './infrastructure/repositories/SupabaseBookRepository';
import { SupabaseMemberRepository } from './infrastructure/repositories/SupabaseMemberRepository';
import { SupabaseBorrowRepository } from './infrastructure/repositories/SupabaseBorrowRepository';
import { SupabaseAuthService } from './infrastructure/auth/SupabaseAuthService';

import { CreateBookUseCase } from './usecases/CreateBookUseCase';
import { GetAllBooksUseCase } from './usecases/GetAllBooksUseCase';
import { UpdateBookUseCase } from './usecases/UpdateBookUseCase';
import { DeleteBookUseCase } from './usecases/DeleteBookUseCase';
import { CreateMemberUseCase } from './usecases/CreateMemberUseCase';
import { GetAllMembersUseCase } from './usecases/GetAllMembersUseCase';
import { UpdateMemberUseCase } from './usecases/UpdateMemberUseCase';
import { DeleteMemberUseCase } from './usecases/DeleteMemberUseCase';
import { BorrowBookUseCase } from './usecases/BorrowBookUseCase';
import { ReturnBookUseCase } from './usecases/ReturnBookUseCase';
import { GetAllBorrowsUseCase } from './usecases/GetAllBorrowsUseCase';

import { BookController } from './controllers/BookController';
import { MemberController } from './controllers/MemberController';
import { BorrowController } from './controllers/BorrowController';
import { AuthController } from './controllers/AuthController';

import { StandardBorrowingStrategy } from './services/StandardBorrowingStrategy';

import { buildAuthMiddleware } from './middleware/authMiddleware';
import { requireRole } from './middleware/requireRole';

const fastify = Fastify({ logger: true });

const supabase = getSupabaseClient();

const bookRepository = new SupabaseBookRepository(supabase);
const memberRepository = new SupabaseMemberRepository(supabase);
const borrowRepository = new SupabaseBorrowRepository(supabase);
const authService = new SupabaseAuthService(supabase, memberRepository);

const borrowingStrategy = new StandardBorrowingStrategy();

const createBookUseCase = new CreateBookUseCase(bookRepository);
const getAllBooksUseCase = new GetAllBooksUseCase(bookRepository);
const updateBookUseCase = new UpdateBookUseCase(bookRepository);
const deleteBookUseCase = new DeleteBookUseCase(bookRepository);

const createMemberUseCase = new CreateMemberUseCase(memberRepository);
const getAllMembersUseCase = new GetAllMembersUseCase(memberRepository);
const updateMemberUseCase = new UpdateMemberUseCase(memberRepository);
const deleteMemberUseCase = new DeleteMemberUseCase(memberRepository);

const borrowBookUseCase = new BorrowBookUseCase(
  bookRepository,
  memberRepository,
  borrowRepository,
  borrowingStrategy
);
const returnBookUseCase = new ReturnBookUseCase(bookRepository, borrowRepository);
const getAllBorrowsUseCase = new GetAllBorrowsUseCase(borrowRepository);

const bookController = new BookController(
  createBookUseCase,
  getAllBooksUseCase,
  updateBookUseCase,
  deleteBookUseCase
);
const memberController = new MemberController(
  createMemberUseCase,
  getAllMembersUseCase,
  updateMemberUseCase,
  deleteMemberUseCase
);
const borrowController = new BorrowController(
  borrowBookUseCase,
  returnBookUseCase,
  getAllBorrowsUseCase
);
const authController = new AuthController(authService);

const authMiddleware = buildAuthMiddleware(authService);
const staffOnly = { preHandler: [authMiddleware, requireRole('staff')] };
const memberOnly = { preHandler: [authMiddleware, requireRole('member')] };
const authOnly = { preHandler: [authMiddleware] };

const start = async () => {
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  fastify.get('/health', async () => ({ status: 'ok' }));

  fastify.post('/auth/signup', (req, rep) => authController.signup(req, rep));

  fastify.get('/books', authOnly, (req, rep) => bookController.getAll(req, rep));
  fastify.post('/books', staffOnly, (req, rep) => bookController.create(req, rep));
  fastify.put('/books/:id', staffOnly, (req, rep) => bookController.update(req, rep));
  fastify.delete('/books/:id', staffOnly, (req, rep) => bookController.delete(req, rep));

  fastify.get('/members', staffOnly, (req, rep) => memberController.getAll(req, rep));
  fastify.post('/members', staffOnly, (req, rep) => memberController.create(req, rep));
  fastify.put('/members/:id', staffOnly, (req, rep) => memberController.update(req, rep));
  fastify.delete('/members/:id', staffOnly, (req, rep) => memberController.delete(req, rep));

  fastify.post('/borrow', memberOnly, (req, rep) => borrowController.borrow(req, rep));
  fastify.post('/return', memberOnly, (req, rep) => borrowController.return(req, rep));
  fastify.get('/borrows', staffOnly, (req, rep) => borrowController.report(req, rep));

  const port = Number(process.env.PORT ?? 4000);
  try {
    await fastify.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
