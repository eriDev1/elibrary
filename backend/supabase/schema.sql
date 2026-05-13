create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  isbn text not null unique,
  is_available boolean not null default true
);

create table public.members (
  id uuid primary key,
  name text not null,
  email text not null unique,
  member_type text not null check (member_type in ('standard', 'student', 'premium'))
);

create table public.borrow_records (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id),
  member_id uuid not null references public.members(id),
  borrow_date timestamptz not null default now(),
  due_date timestamptz not null,
  return_date timestamptz
);

alter table public.books enable row level security;
alter table public.members enable row level security;
alter table public.borrow_records enable row level security;
