
alter table public.books
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.members
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_books_updated_at on public.books;
create trigger set_books_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

drop trigger if exists set_members_updated_at on public.members;
create trigger set_members_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();
