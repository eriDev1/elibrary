import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';

import { getSupabaseClient } from './infrastructure/supabase/supabaseClient';
import { BookRepository } from './infrastructure/repositories/BookRepository';
import { MemberRepository } from './infrastructure/repositories/MemberRepository';
import { BorrowRepository } from './infrastructure/repositories/BorrowRepository';
import { SupabaseAuthService } from './infrastructure/auth/SupabaseAuthService';

import { CreateBookUseCase } from './usecases/CreateBookUseCase';
import { GetAllBooksUseCase } from './usecases/GetAllBooksUseCase';
import { UpdateBookUseCase } from './usecases/UpdateBookUseCase';
import { DeleteBookUseCase } from './usecases/DeleteBookUseCase';
import { CreateMemberUseCase } from './usecases/CreateMemberUseCase';
import { GetAllMembersUseCase } from './usecases/GetAllMembersUseCase';
import { UpdateMemberUseCase } from './usecases/UpdateMemberUseCase';
import { DeleteMemberUseCase } from './usecases/DeleteMemberUseCase';
import { GetMemberBorrowHistoryUseCase } from './usecases/GetMemberBorrowHistoryUseCase';
import { BorrowBookUseCase } from './usecases/BorrowBookUseCase';
import { ReturnBookUseCase } from './usecases/ReturnBookUseCase';
import { GetAllBorrowsUseCase } from './usecases/GetAllBorrowsUseCase';
import { GetMyActiveBorrowsUseCase } from './usecases/GetMyActiveBorrowsUseCase';
import { GetMyBorrowHistoryUseCase } from './usecases/GetMyBorrowHistoryUseCase';
import { GetMemberLoanPeriodUseCase } from './usecases/GetMemberLoanPeriodUseCase';

import { BookController } from './controllers/BookController';
import { MemberController } from './controllers/MemberController';
import { BorrowController } from './controllers/BorrowController';
import { AuthController } from './controllers/AuthController';

import { StandardBorrowingStrategy } from './services/StandardBorrowingStrategy';
import { StudentBorrowingStrategy } from './services/StudentBorrowingStrategy';
import { PremiumBorrowingStrategy } from './services/PremiumBorrowingStrategy';
import { MemberTypeBorrowingStrategyResolver } from './services/MemberTypeBorrowingStrategyResolver';

import { buildAuthMiddleware } from './middleware/authMiddleware';
import { requireRole } from './middleware/requireRole';

const fastify = Fastify({ logger: true });

const supabase = getSupabaseClient();

const bookRepository = new BookRepository(supabase);
const memberRepository = new MemberRepository(supabase);
const borrowRepository = new BorrowRepository(supabase);
const authService = new SupabaseAuthService(supabase, memberRepository);

const borrowingStrategyResolver = new MemberTypeBorrowingStrategyResolver(
  new StandardBorrowingStrategy(),
  new StudentBorrowingStrategy(),
  new PremiumBorrowingStrategy()
);

const createBookUseCase = new CreateBookUseCase(bookRepository);
const getAllBooksUseCase = new GetAllBooksUseCase(bookRepository);
const updateBookUseCase = new UpdateBookUseCase(bookRepository);
const deleteBookUseCase = new DeleteBookUseCase(bookRepository);

const createMemberUseCase = new CreateMemberUseCase(memberRepository);
const getAllMembersUseCase = new GetAllMembersUseCase(memberRepository);
const updateMemberUseCase = new UpdateMemberUseCase(memberRepository);
const deleteMemberUseCase = new DeleteMemberUseCase(memberRepository);
const getMemberBorrowHistoryUseCase = new GetMemberBorrowHistoryUseCase(
  memberRepository,
  borrowRepository
);

const borrowBookUseCase = new BorrowBookUseCase(
  bookRepository,
  memberRepository,
  borrowRepository,
  borrowingStrategyResolver
);
const returnBookUseCase = new ReturnBookUseCase(bookRepository, borrowRepository);
const getAllBorrowsUseCase = new GetAllBorrowsUseCase(borrowRepository);
const getMyActiveBorrowsUseCase = new GetMyActiveBorrowsUseCase(borrowRepository);
const getMyBorrowHistoryUseCase = new GetMyBorrowHistoryUseCase(borrowRepository);
const getMemberLoanPeriodUseCase = new GetMemberLoanPeriodUseCase(
  memberRepository,
  borrowingStrategyResolver
);

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
  deleteMemberUseCase,
  getMemberBorrowHistoryUseCase
);
const borrowController = new BorrowController(
  borrowBookUseCase,
  returnBookUseCase,
  getAllBorrowsUseCase,
  getMyActiveBorrowsUseCase,
  getMyBorrowHistoryUseCase,
  getMemberLoanPeriodUseCase
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
  fastify.get('/members/:id/borrows', staffOnly, (req, rep) =>
    memberController.borrowHistory(req, rep)
  );
  fastify.post('/members', staffOnly, (req, rep) => memberController.create(req, rep));
  fastify.put('/members/:id', staffOnly, (req, rep) => memberController.update(req, rep));
  fastify.delete('/members/:id', staffOnly, (req, rep) => memberController.delete(req, rep));

  fastify.post('/borrow', memberOnly, (req, rep) => borrowController.borrow(req, rep));
  fastify.get('/borrow/my', memberOnly, (req, rep) => borrowController.myActive(req, rep));
  fastify.get('/borrow/history', memberOnly, (req, rep) => borrowController.myHistory(req, rep));
  fastify.get('/borrow/period', memberOnly, (req, rep) =>
    borrowController.memberLoanPeriod(req, rep)
  );
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
