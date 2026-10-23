-- Phase 5: reputation
-- Opens review submission (temporarily not job-gated — tightened in Phase 6
-- once completed jobs exist), adds a server-side trigger that recalculates
-- a professional's aggregate rating so the frontend can never set it
-- directly, and adds reputation breakdown columns + badges.

-- ---------------------------------------------------------------------
-- Reviews: one review per customer per professional. Insert is allowed for
-- any authenticated customer for now; Phase 6 will add a check that the
-- customer has a completed job with this professional.
-- ---------------------------------------------------------------------
alter table public.reviews
  add constraint reviews_one_per_customer unique (professional_id, customer_id);

create policy "A customer can leave one review per professional"
  on public.reviews for insert
  to authenticated
  with check (auth.uid() = customer_id);

create policy "A customer can update their own review"
  on public.reviews for update
  to authenticated
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

-- ---------------------------------------------------------------------
-- Reputation breakdown columns. Nullable until there's enough job/response
-- data (Phase 6/7) to compute them meaningfully.
-- ---------------------------------------------------------------------
alter table public.professionals
  add column if not exists reliability_score numeric,
  add column if not exists communication_score numeric,
  add column if not exists timeliness_score numeric,
  add column if not exists response_rate numeric,
  add column if not exists completion_rate numeric,
  add column if not exists repeat_customers int not null default 0;

-- ---------------------------------------------------------------------
-- Server-authoritative rating: recalculated from public.reviews whenever a
-- review is added, edited, or removed. The frontend never writes
-- professionals.rating directly — there is no update policy exposing it.
-- ---------------------------------------------------------------------
create or replace function public.recalculate_professional_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_id uuid := coalesce(new.professional_id, old.professional_id);
begin
  update public.professionals
  set rating = (
    select round(avg(rating)::numeric, 2)
    from public.reviews
    where professional_id = target_id
  )
  where id = target_id;
  return null;
end;
$$;

create trigger reviews_recalculate_rating
  after insert or update or delete on public.reviews
  for each row
  execute function public.recalculate_professional_rating();

-- ---------------------------------------------------------------------
-- Badges. Awarding is server-side only (e.g. an admin action in Phase 11
-- or a future automated job) — no insert/update policy is exposed here,
-- so the frontend can only ever read badges, never grant them.
-- ---------------------------------------------------------------------
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text not null default 'award',
  created_at timestamptz not null default now()
);

alter table public.badges enable row level security;

create policy "Badges are viewable by authenticated users"
  on public.badges for select
  to authenticated
  using (true);

insert into public.badges (name, description, icon) values
  ('Top Rated', 'Maintains a 4.8+ average rating', 'star'),
  ('Fast Responder', 'Typically replies within the hour', 'zap'),
  ('Reliable Pro', 'Consistently on time and thorough', 'shield-check'),
  ('Rising Talent', 'New professional building a strong track record', 'trending-up')
on conflict do nothing;

create table if not exists public.professional_badges (
  professional_id uuid not null references public.professionals (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (professional_id, badge_id)
);

alter table public.professional_badges enable row level security;

create policy "Professional badges are viewable by authenticated users"
  on public.professional_badges for select
  to authenticated
  using (true);