create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  isbn text not null unique,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.members (
  id uuid primary key,
  name text not null,
  email text not null unique,
  member_type text not null check (member_type in ('standard', 'student', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.borrow_records (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  borrow_date timestamptz not null default now(),
  due_date timestamptz not null,
  return_date timestamptz
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_books_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

create trigger set_members_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();

alter table public.books enable row level security;
alter table public.members enable row level security;
alter table public.borrow_records enable row level security;
