-- Phase 8: live tracking
-- One live-location row per job, upserted by the accepted professional
-- while the job is actively en route. Not a permanent location log --
-- there is no history table, just the current position.

create table if not exists public.job_tracking (
  job_id uuid primary key references public.jobs (id) on delete cascade,
  professional_id uuid not null references public.professionals (id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  heading numeric,
  updated_at timestamptz not null default now()
);

alter table public.job_tracking enable row level security;

create policy "The job's customer and accepted professional can view tracking"
  on public.job_tracking for select
  to authenticated
  using (
    exists (
      select 1 from public.jobs
      where jobs.id = job_tracking.job_id
        and (jobs.customer_id = auth.uid() or jobs.accepted_professional_id = auth.uid())
    )
  );

create policy "Only the accepted professional can share their location"
  on public.job_tracking for insert
  to authenticated
  with check (
    auth.uid() = professional_id
    and exists (
      select 1 from public.jobs
      where jobs.id = job_tracking.job_id
        and jobs.accepted_professional_id = auth.uid()
        and jobs.status in ('on_the_way', 'arrived', 'in_progress')
    )
  );

create policy "Only the accepted professional can update their location"
  on public.job_tracking for update
  to authenticated
  using (auth.uid() = professional_id)
  with check (
    auth.uid() = professional_id
    and exists (
      select 1 from public.jobs
      where jobs.id = job_tracking.job_id
        and jobs.accepted_professional_id = auth.uid()
        and jobs.status in ('on_the_way', 'arrived', 'in_progress')
    )
  );

create policy "The accepted professional can stop sharing"
  on public.job_tracking for delete
  to authenticated
  using (auth.uid() = professional_id);