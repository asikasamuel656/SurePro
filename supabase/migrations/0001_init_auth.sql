-- Phase 1: authentication foundation
-- Creates the profiles table, locks it down with RLS, and auto-populates a
-- row for every new auth.users signup via a trigger.

create extension if not exists "pgcrypto";

create type account_type as enum ('customer', 'professional');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type account_type not null default 'customer',
  full_name text,
  phone text,
  avatar_url text,
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone signed in can read basic profile info (needed later so customers
-- can view a professional's public profile). Writes are restricted to the
-- owner only.
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Keep updated_at current on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Auto-create a profiles row whenever a new user signs up, pulling the
-- fields we stashed in user_metadata during supabase.auth.signUp().
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, account_type, full_name, phone)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'account_type')::account_type, 'customer'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();