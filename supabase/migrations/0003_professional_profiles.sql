-- Phase 3: professional profiles
-- Extends professionals with bio/verification, and adds services,
-- portfolio_items, reviews (read-only for now) and follows.

alter table public.professionals
  add column if not exists bio text,
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified')),
  add column if not exists years_experience int;

-- ---------------------------------------------------------------------
-- Services offered by a professional, each with its own price.
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  name text not null,
  description text,
  price_min numeric,
  price_max numeric,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Services are viewable by authenticated users"
  on public.services for select
  to authenticated
  using (true);

create policy "A professional manages their own services"
  on public.services for all
  to authenticated
  using (auth.uid() = professional_id)
  with check (auth.uid() = professional_id);

-- ---------------------------------------------------------------------
-- Portfolio / gallery images. Stored as URLs for now — Storage bucket
-- upload wiring (Supabase Storage / Cloudinary) plugs in when the shared
-- ImageUploader component is built.
-- ---------------------------------------------------------------------
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.portfolio_items enable row level security;

create policy "Portfolio items are viewable by authenticated users"
  on public.portfolio_items for select
  to authenticated
  using (true);

create policy "A professional manages their own portfolio"
  on public.portfolio_items for all
  to authenticated
  using (auth.uid() = professional_id)
  with check (auth.uid() = professional_id);

-- ---------------------------------------------------------------------
-- Reviews. Read-only via the API for now: inserts are locked down until
-- Phase 5/6 wire this to real completed jobs, so nobody can fabricate a
-- review from the frontend today.
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by authenticated users"
  on public.reviews for select
  to authenticated
  using (true);

-- Intentionally no insert/update/delete policy yet — reviews can only be
-- written server-side (e.g. via a Phase 5/6 job-completion Edge Function),
-- keeping reputation data server-authoritative per product requirement.

-- ---------------------------------------------------------------------
-- Follows: a customer (or anyone) following a professional.
-- ---------------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.professionals (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, professional_id)
);

alter table public.follows enable row level security;

create policy "Follow rows are viewable by authenticated users"
  on public.follows for select
  to authenticated
  using (true);

create policy "A user manages their own follows"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

create policy "A user can unfollow"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);