-- Phase 6: jobs + quotes
-- No escrow. Customer posts a job, professionals quote, customer accepts
-- one, the job moves through a status lifecycle that's logged into
-- job_status_events (the "job passport").

create type job_status as enum (
  'open', 'quoted', 'accepted', 'preparing', 'on_the_way',
  'arrived', 'in_progress', 'completed', 'cancelled'
);

create type quote_status as enum ('pending', 'accepted', 'declined', 'withdrawn');

-- ---------------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid references public.categories (id),
  title text not null,
  description text,
  address text,
  latitude double precision,
  longitude double precision,
  budget_min numeric,
  budget_max numeric,
  status job_status not null default 'open',
  accepted_professional_id uuid references public.professionals (id),
  accepted_quote_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

-- Customers see their own jobs; the accepted professional sees the job
-- they're working; any professional can browse jobs that are still open
-- for quoting (or already quoted, so they can see they missed it).
create policy "Jobs are viewable by their customer, accepted pro, or browsing pros"
  on public.jobs for select
  to authenticated
  using (
    auth.uid() = customer_id
    or auth.uid() = accepted_professional_id
    or status in ('open', 'quoted')
  );

create policy "A customer can create their own job"
  on public.jobs for insert
  to authenticated
  with check (auth.uid() = customer_id);

create policy "A customer can update their own job"
  on public.jobs for update
  to authenticated
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

create policy "The accepted professional can advance job status"
  on public.jobs for update
  to authenticated
  using (auth.uid() = accepted_professional_id)
  with check (auth.uid() = accepted_professional_id);

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  professional_id uuid not null references public.professionals (id) on delete cascade,
  price numeric not null,
  message text,
  status quote_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (job_id, professional_id)
);

alter table public.quotes enable row level security;

create policy "A job's customer and quoting professionals can view its quotes"
  on public.quotes for select
  to authenticated
  using (
    auth.uid() = professional_id
    or exists (select 1 from public.jobs where jobs.id = quotes.job_id and jobs.customer_id = auth.uid())
  );

create policy "A professional can submit a quote on an open job"
  on public.quotes for insert
  to authenticated
  with check (
    auth.uid() = professional_id
    and exists (
      select 1 from public.jobs
      where jobs.id = quotes.job_id and jobs.status in ('open', 'quoted')
    )
  );

-- The job's customer can accept/decline quotes; the quoting professional
-- can withdraw their own.
create policy "A job's customer can update its quotes"
  on public.quotes for update
  to authenticated
  using (exists (select 1 from public.jobs where jobs.id = quotes.job_id and jobs.customer_id = auth.uid()))
  with check (exists (select 1 from public.jobs where jobs.id = quotes.job_id and jobs.customer_id = auth.uid()));

create policy "A professional can withdraw their own quote"
  on public.quotes for update
  to authenticated
  using (auth.uid() = professional_id)
  with check (auth.uid() = professional_id);

-- Move a fresh job to 'quoted' as soon as it gets its first quote.
create or replace function public.mark_job_quoted()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.jobs set status = 'quoted' where id = new.job_id and status = 'open';
  return new;
end;
$$;

create trigger quotes_mark_job_quoted
  after insert on public.quotes
  for each row
  execute function public.mark_job_quoted();

-- ---------------------------------------------------------------------
-- Job passport: every status change is logged automatically.
create table if not exists public.job_status_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  status job_status not null,
  created_at timestamptz not null default now()
);

alter table public.job_status_events enable row level security;

create policy "Job status events follow job visibility"
  on public.job_status_events for select
  to authenticated
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = job_status_events.job_id
        and (
          jobs.customer_id = auth.uid()
          or jobs.accepted_professional_id = auth.uid()
          or jobs.status in ('open', 'quoted')
        )
    )
  );

create or replace function public.log_job_status_event()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.job_status_events (job_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$;

create trigger jobs_log_status_event
  after update on public.jobs
  for each row
  execute function public.log_job_status_event();

-- Seed the initial 'open' event whenever a job is created.
create or replace function public.log_job_created_event()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.job_status_events (job_id, status) values (new.id, new.status);
  return new;
end;
$$;

create trigger jobs_log_created_event
  after insert on public.jobs
  for each row
  execute function public.log_job_created_event();

-- ---------------------------------------------------------------------
create table if not exists public.job_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id),
  photo_url text not null,
  stage text not null default 'progress' check (stage in ('before', 'progress', 'after')),
  created_at timestamptz not null default now()
);

alter table public.job_photos enable row level security;

create policy "Job photos follow job visibility"
  on public.job_photos for select
  to authenticated
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = job_photos.job_id
        and (jobs.customer_id = auth.uid() or jobs.accepted_professional_id = auth.uid())
    )
  );

create policy "The customer or accepted professional can add job photos"
  on public.job_photos for insert
  to authenticated
  with check (
    auth.uid() = uploaded_by
    and exists (
      select 1 from public.jobs
      where jobs.id = job_photos.job_id
        and (jobs.customer_id = auth.uid() or jobs.accepted_professional_id = auth.uid())
    )
  );