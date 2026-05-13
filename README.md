# eLibrary — Library Management System

A full-stack Library Management System built with:

- **Backend**: Fastify + TypeScript (Clean Architecture, SOLID, Strategy Pattern)
- **Frontend**: React + TanStack Router (TanStack Start)
- **Database & Auth**: Supabase (PostgreSQL + JWT authentication)

## Quick start

### 1. Set up Supabase

Create a free project at [supabase.com](https://supabase.com), run `backend/supabase/schema.sql` in the SQL Editor, and create a staff user (see `backend/README.md` for details).

### 2. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

# Frontend
cp frontend/.env.example frontend/.env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL=http://localhost:4000
```

### 3. Run backend (port 4000)

```bash
cd backend
npm install
npm run dev
```

### 4. Run frontend (port 3000)

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000`.

## How roles work

| Role | Created by | Can do |
|---|---|---|
| **staff** | Manually in Supabase dashboard | Add books, view/add members |
| **member** | Self-signup at `/signup` | Browse books, borrow and return |

The JWT issued by Supabase contains `app_metadata.role`. Every API request must include `Authorization: Bearer <token>`. The backend verifies the token with Supabase and enforces the role on each route.

## Project structure

```
elibrary/
  backend/          ← Fastify API (port 4000)
  frontend/         ← React + TanStack Router (port 3000)
```
