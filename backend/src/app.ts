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
import { CreateMemberUseCase } from './usecases/CreateMemberUseCase';
import { GetAllMembersUseCase } from './usecases/GetAllMembersUseCase';
import { BorrowBookUseCase } from './usecases/BorrowBookUseCase';
import { ReturnBookUseCase } from './usecases/ReturnBookUseCase';

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
const createMemberUseCase = new CreateMemberUseCase(memberRepository);
const getAllMembersUseCase = new GetAllMembersUseCase(memberRepository);
const borrowBookUseCase = new BorrowBookUseCase(
  bookRepository,
  memberRepository,
  borrowRepository,
  borrowingStrategy
);
const returnBookUseCase = new ReturnBookUseCase(bookRepository, borrowRepository);

const bookController = new BookController(createBookUseCase, getAllBooksUseCase);
const memberController = new MemberController(createMemberUseCase, getAllMembersUseCase);
const borrowController = new BorrowController(borrowBookUseCase, returnBookUseCase);
const authController = new AuthController(authService);

const authMiddleware = buildAuthMiddleware(authService);

const start = async () => {
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  fastify.get('/health', async () => ({ status: 'ok' }));

  fastify.post('/auth/signup', (req, rep) => authController.signup(req, rep));

  fastify.get('/books', { preHandler: [authMiddleware] }, (req, rep) =>
    bookController.getAll(req, rep)
  );
  fastify.post(
    '/books',
    { preHandler: [authMiddleware, requireRole('staff')] },
    (req, rep) => bookController.create(req, rep)
  );

  fastify.get(
    '/members',
    { preHandler: [authMiddleware, requireRole('staff')] },
    (req, rep) => memberController.getAll(req, rep)
  );
  fastify.post(
    '/members',
    { preHandler: [authMiddleware, requireRole('staff')] },
    (req, rep) => memberController.create(req, rep)
  );

  fastify.post(
    '/borrow',
    { preHandler: [authMiddleware, requireRole('member')] },
    (req, rep) => borrowController.borrow(req, rep)
  );
  fastify.post(
    '/return',
    { preHandler: [authMiddleware, requireRole('member')] },
    (req, rep) => borrowController.return(req, rep)
  );

  const port = Number(process.env.PORT ?? 4000);
  try {
    await fastify.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
