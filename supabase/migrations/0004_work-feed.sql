-- Phase 4: work feed
-- Professionals publish work; customers like, comment, save, and follow
-- from posts.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete cascade,
  caption text,
  post_type text not null default 'update'
    check (post_type in ('completed_work', 'before_after', 'update')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by authenticated users"
  on public.posts for select
  to authenticated
  using (true);

create policy "A professional manages their own posts"
  on public.posts for all
  to authenticated
  using (auth.uid() = professional_id)
  with check (auth.uid() = professional_id);

create trigger posts_set_updated_at
  before update on public.posts
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  is_before boolean not null default false, -- used for before/after pairs
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.post_media enable row level security;

create policy "Post media is viewable by authenticated users"
  on public.post_media for select
  to authenticated
  using (true);

create policy "A professional manages media on their own posts"
  on public.post_media for all
  to authenticated
  using (
    exists (
      select 1 from public.posts
      where posts.id = post_media.post_id and posts.professional_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.posts
      where posts.id = post_media.post_id and posts.professional_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
create table if not exists public.reactions (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.reactions enable row level security;

create policy "Reactions are viewable by authenticated users"
  on public.reactions for select
  to authenticated
  using (true);

create policy "A user manages their own reactions"
  on public.reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "A user can remove their own reaction"
  on public.reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Comments are viewable by authenticated users"
  on public.comments for select
  to authenticated
  using (true);

create policy "A user can add comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "A user can delete their own comments"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
create table if not exists public.saved_posts (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.saved_posts enable row level security;

create policy "A user sees only their own saved posts"
  on public.saved_posts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "A user manages their own saved posts"
  on public.saved_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "A user can unsave"
  on public.saved_posts for delete
  to authenticated
  using (auth.uid() = user_id);