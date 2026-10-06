-- LibroSeat Supabase schema
-- Run this once in Supabase Dashboard -> SQL Editor.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('student', 'staff');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  student_id text,
  email text unique not null,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  status text not null default 'available',
  created_at timestamptz not null default now()
);

create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  status text not null default 'available',
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('book', 'seat')),
  ref_id uuid,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Saved payment methods. Never store full card numbers or CVV.
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  cardholder_name text not null,
  brand text not null,
  last4 text not null,
  expiry_month integer not null check (expiry_month between 1 and 12),
  expiry_year integer not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.seats enable row level security;
alter table public.reservations enable row level security;
alter table public.notifications enable row level security;
alter table public.payment_methods enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Anyone signed in can read books" on public.books;
create policy "Anyone signed in can read books"
on public.books for select
to authenticated
using (true);

drop policy if exists "Anyone signed in can read seats" on public.seats;
create policy "Anyone signed in can read seats"
on public.seats for select
to authenticated
using (true);

drop policy if exists "Users read own reservations" on public.reservations;
create policy "Users read own reservations"
on public.reservations for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users update own reservations" on public.reservations;
create policy "Users update own reservations"
on public.reservations for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
on public.notifications for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
on public.notifications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users read own payment methods" on public.payment_methods;
create policy "Users read own payment methods"
on public.payment_methods for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users insert own payment methods" on public.payment_methods;
create policy "Users insert own payment methods"
on public.payment_methods for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users update own payment methods" on public.payment_methods;
create policy "Users update own payment methods"
on public.payment_methods for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users delete own payment methods" on public.payment_methods;
create policy "Users delete own payment methods"
on public.payment_methods for delete
to authenticated
using (auth.uid() = user_id);

-- Optional staff account setup:
-- 1. Create a Supabase Auth user with email like staff001@libroseat-staff.local.
-- 2. Insert/update that user's profile with role = 'staff'.
-- Example after finding the auth.users.id value:
-- update public.profiles set role = 'staff' where email = 'staff001@libroseat-staff.local';
