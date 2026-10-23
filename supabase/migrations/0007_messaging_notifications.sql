-- Phase 7: messaging + notifications
-- Realtime 1:1 conversations, optionally linked to a job, plus a
-- notifications table that is only ever written by server-side triggers —
-- never directly by the frontend — so notifications can't be spoofed.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

alter table public.conversation_participants enable row level security;

create policy "A user sees conversations they participate in"
  on public.conversations for select
  to authenticated
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_participants.conversation_id = conversations.id
        and conversation_participants.user_id = auth.uid()
    )
  );

create policy "A user sees participant rows for their own conversations"
  on public.conversation_participants for select
  to authenticated
  using (
    conversation_id in (
      select conversation_id from public.conversation_participants where user_id = auth.uid()
    )
  );

create policy "A user can update their own last_read_at"
  on public.conversation_participants for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Atomically create a 1:1 conversation (or return the existing one) so we
-- never race two inserts + two participant rows across separate RLS-guarded
-- round trips from the client.
create or replace function public.start_conversation(other_user_id uuid, p_job_id uuid default null)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  existing_id uuid;
  new_id uuid;
begin
  select cp1.conversation_id into existing_id
  from public.conversation_participants cp1
  join public.conversation_participants cp2
    on cp1.conversation_id = cp2.conversation_id
  where cp1.user_id = auth.uid()
    and cp2.user_id = other_user_id
    and (p_job_id is null or exists (
      select 1 from public.conversations c where c.id = cp1.conversation_id and c.job_id = p_job_id
    ))
  limit 1;

  if existing_id is not null then
    return existing_id;
  end if;

  insert into public.conversations (job_id) values (p_job_id) returning id into new_id;
  insert into public.conversation_participants (conversation_id, user_id) values
    (new_id, auth.uid()),
    (new_id, other_user_id);

  return new_id;
end;
$$;

-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  message_type text not null default 'text'
    check (message_type in ('text', 'image', 'job_update', 'quote', 'location')),
  content text,
  image_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "A user sees messages in their own conversations"
  on public.messages for select
  to authenticated
  using (
    conversation_id in (
      select conversation_id from public.conversation_participants where user_id = auth.uid()
    )
  );

create policy "A user can send messages in their own conversations"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and conversation_id in (
      select conversation_id from public.conversation_participants where user_id = auth.uid()
    )
  );

create or replace function public.bump_conversation_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_bump_conversation
  after insert on public.messages
  for each row
  execute function public.bump_conversation_updated_at();

-- ---------------------------------------------------------------------
-- Notifications. No insert policy is exposed — every row is written by a
-- trigger (security definer) below, so the frontend can only ever read and
-- mark-as-read, never fabricate a notification.
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "A user sees only their own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "A user can mark their own notifications read"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.create_notification(
  p_user_id uuid, p_type text, p_title text, p_body text default null, p_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, data)
  values (p_user_id, p_type, p_title, p_body, p_data);
end;
$$;

-- New message -> notify the other participant(s).
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  participant record;
begin
  for participant in
    select user_id from public.conversation_participants
    where conversation_id = new.conversation_id and user_id <> new.sender_id
  loop
    perform public.create_notification(
      participant.user_id, 'message', 'New message',
      case when new.message_type = 'text' then left(new.content, 120) else 'Sent an attachment' end,
      jsonb_build_object('conversation_id', new.conversation_id)
    );
  end loop;
  return new;
end;
$$;

create trigger messages_notify
  after insert on public.messages
  for each row
  execute function public.notify_new_message();

-- New quote -> notify the job's customer.
create or replace function public.notify_new_quote()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_customer_id uuid;
  v_job_title text;
begin
  select customer_id, title into v_customer_id, v_job_title from public.jobs where id = new.job_id;
  perform public.create_notification(
    v_customer_id, 'new_quote', 'New quote received',
    'You got a new quote for "' || coalesce(v_job_title, 'your job') || '"',
    jsonb_build_object('job_id', new.job_id, 'quote_id', new.id)
  );
  return new;
end;
$$;

create trigger quotes_notify
  after insert on public.quotes
  for each row
  execute function public.notify_new_quote();

-- Job status changes -> notify the relevant side.
create or replace function public.notify_job_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'accepted' and new.accepted_professional_id is not null then
      perform public.create_notification(
        new.accepted_professional_id, 'job_accepted', 'Job accepted',
        'Your quote for "' || new.title || '" was accepted',
        jsonb_build_object('job_id', new.id)
      );
    elsif new.status = 'on_the_way' then
      perform public.create_notification(
        new.customer_id, 'professional_on_the_way', 'Your pro is on the way',
        new.title, jsonb_build_object('job_id', new.id)
      );
    elsif new.status = 'arrived' then
      perform public.create_notification(
        new.customer_id, 'professional_arrived', 'Your pro has arrived',
        new.title, jsonb_build_object('job_id', new.id)
      );
    end if;
  end if;
  return new;
end;
$$;

create trigger jobs_notify_status_change
  after update on public.jobs
  for each row
  execute function public.notify_job_status_change();

-- Social notifications: comment, like, follow, review, badge.
create or replace function public.notify_new_comment()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner uuid;
begin
  select professional_id into v_owner from public.posts where id = new.post_id;
  if v_owner is not null and v_owner <> new.user_id then
    perform public.create_notification(v_owner, 'comment', 'New comment on your post', new.content,
      jsonb_build_object('post_id', new.post_id));
  end if;
  return new;
end;
$$;

create trigger comments_notify
  after insert on public.comments
  for each row
  execute function public.notify_new_comment();

create or replace function public.notify_new_like()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner uuid;
begin
  select professional_id into v_owner from public.posts where id = new.post_id;
  if v_owner is not null and v_owner <> new.user_id then
    perform public.create_notification(v_owner, 'like', 'Someone liked your post', null,
      jsonb_build_object('post_id', new.post_id));
  end if;
  return new;
end;
$$;

create trigger reactions_notify
  after insert on public.reactions
  for each row
  execute function public.notify_new_like();

create or replace function public.notify_new_follow()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.create_notification(new.professional_id, 'follow', 'You have a new follower', null,
    jsonb_build_object('follower_id', new.follower_id));
  return new;
end;
$$;

create trigger follows_notify
  after insert on public.follows
  for each row
  execute function public.notify_new_follow();

create or replace function public.notify_new_review()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.create_notification(new.professional_id, 'review', 'You received a new review',
    new.comment, jsonb_build_object('review_id', new.id));
  return new;
end;
$$;

create trigger reviews_notify
  after insert on public.reviews
  for each row
  execute function public.notify_new_review();

create or replace function public.notify_new_badge()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_name text;
begin
  select name into v_name from public.badges where id = new.badge_id;
  perform public.create_notification(new.professional_id, 'badge', 'New badge earned!', v_name,
    jsonb_build_object('badge_id', new.badge_id));
  return new;
end;
$$;

create trigger professional_badges_notify
  after insert on public.professional_badges
  for each row
  execute function public.notify_new_badge();