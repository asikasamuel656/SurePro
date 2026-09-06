-- Phase 2: home, location, discovery
-- Adds categories (seeded) and a minimal professionals table sufficient for
-- nearby-search. Phase 3 will extend professionals with portfolio, gallery,
-- verification, availability schedule, etc.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null, -- matches an icon key in CategoryPill.jsx
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
  on public.categories for select
  to authenticated
  using (true);

insert into public.categories (name, icon, sort_order) values
  ('Plumbing', 'plumbing', 1),
  ('Electrical', 'electrical', 2),
  ('Cleaning', 'cleaning', 3),
  ('Carpentry', 'carpentry', 4),
  ('Painting', 'painting', 5),
  ('Gardening', 'gardening', 6),
  ('Movers', 'movers', 7),
  ('Appliance Repair', 'appliance_repair', 8)
on conflict do nothing;

-- Minimal professionals table: enough columns to power the discovery list
-- and nearby-search map. Extended in Phase 3 with portfolio/gallery/etc.
create table if not exists public.professionals (
  id uuid primary key references public.profiles (id) on delete cascade,
  category_id uuid references public.categories (id),
  headline text,
  rate_min numeric,
  rate_max numeric,
  latitude double precision,
  longitude double precision,
  rating numeric,
  completed_jobs int not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.professionals enable row level security;

create policy "Professionals are viewable by authenticated users"
  on public.professionals for select
  to authenticated
  using (true);

create policy "A professional can insert their own row"
  on public.professionals for insert
  to authenticated
  with check (
    auth.uid() = id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.account_type = 'professional'
    )
  );

create policy "A professional can update their own row"
  on public.professionals for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create trigger professionals_set_updated_at
  before update on public.professionals
  for each row
  execute function public.set_updated_at();