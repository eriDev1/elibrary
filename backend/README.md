# eLibrary Backend

Library Management System API built with Fastify, TypeScript, and Supabase.

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, then run the SQL in `supabase/schema.sql` in the **SQL Editor** of your Supabase dashboard.

### 2. Create a staff user

In your Supabase dashboard go to **Authentication → Users → Add user**. Fill in email and password, then in the **User metadata** section set:

```json
{ "role": "staff" }
```

Copy and paste into the `app_metadata` field (not `user_metadata`).

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env` with your Supabase project values:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key |
| `SUPABASE_ANON_KEY` | Project Settings → API → anon key |
| `PORT` | Leave as `4000` |

### 4. Install and run

```bash
npm install
npm run dev
```

The API listens on `http://localhost:4000`.

## API endpoints

| Method | Path | Role required | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Register a new member |
| GET | `/books` | any authenticated | List all books |
| POST | `/books` | staff | Add a new book |
| GET | `/members` | staff | List all members |
| POST | `/members` | staff | Add a member record |
| POST | `/borrow` | member | Borrow a book |
| POST | `/return` | member | Return a book |
| GET | `/health` | — | Health check |

All endpoints except `/auth/signup` and `/health` require `Authorization: Bearer <jwt>`.

## Architecture

```
src/
  app.ts                        ← composition root, wires everything together
  controllers/                  ← handle HTTP requests and responses
  usecases/                     ← business logic (one class per operation)
  domain/
    entities/                   ← Book, Member, BorrowRecord
    interfaces/                 ← IBookRepository, IMemberRepository, IBorrowRepository, IAuthService, IBorrowingStrategy, IUseCase
  services/                     ← borrowing strategies (Standard, Premium, Student)
  infrastructure/
    supabase/                   ← Supabase client factory
    repositories/               ← Supabase implementations of domain interfaces
    auth/                       ← SupabaseAuthService
  middleware/                   ← authMiddleware (Bearer verify) + requireRole
```

This architecture follows Clean Architecture and SOLID principles:

- **Single Responsibility**: each class has exactly one job
- **Open/Closed**: adding a new borrowing strategy only requires a new class implementing `IBorrowingStrategy` — no existing code changes
- **Dependency Injection**: all dependencies are passed via constructor in `app.ts`
- **Strategy Pattern**: `StandardBorrowingStrategy`, `PremiumBorrowingStrategy`, and `StudentBorrowingStrategy` all implement `IBorrowingStrategy` and can be swapped at runtime
