-- SurePro: messaging access-control fixes
-- Migration: 0016_messaging_access_control_fixes.sql

begin;

-- 1. Remove existing messaging policies by their actual live names.
-- Also remove older names in case they exist in another environment.

drop policy if exists
  "Users can update their read status"
  on public.conversation_participants;

drop policy if exists
  "Users can view participants in their conversations"
  on public.conversation_participants;

drop policy if exists
  "Participants can update conversations"
  on public.conversations;

drop policy if exists
  "Participants can view conversations"
  on public.conversations;

drop policy if exists
  "Participants can send messages"
  on public.messages;

drop policy if exists
  "Participants can view messages"
  on public.messages;

drop policy if exists
  "A user can update their own last_read_at"
  on public.conversation_participants;

drop policy if exists
  "A user sees participant rows for their own conversations"
  on public.conversation_participants;

drop policy if exists
  "A user sees conversations they participate in"
  on public.conversations;

drop policy if exists
  "A user sees messages in their own conversations"
  on public.messages;

drop policy if exists
  "A user can send messages in their own conversations"
  on public.messages;


-- 2. Membership helper: checks only the signed-in user's membership.
create or replace function public.is_conversation_participant(
  p_conversation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_conversation_participant(uuid)
  from public, anon;

grant execute on function public.is_conversation_participant(uuid)
  to authenticated;


-- 3. Participants can see participant rows in their conversations.
create policy "Participants can view their conversation participants"
  on public.conversation_participants
  for select
  to authenticated
  using (
    public.is_conversation_participant(conversation_id)
  );


-- 4. Restrict participant updates to the read timestamp only.
create policy "Participants can update their own read timestamp"
  on public.conversation_participants
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke update on public.conversation_participants
  from public, anon, authenticated;

grant update (last_read_at)
  on public.conversation_participants
  to authenticated;


-- 5. Conversation records are visible only to participants.
create policy "Participants can view their conversations"
  on public.conversations
  for select
  to authenticated
  using (
    public.is_conversation_participant(id)
  );

-- The frontend currently reads conversations but does not update them.
-- Remove unnecessary client-side update access.
revoke update on public.conversations
  from public, anon, authenticated;


-- 6. Messages are visible to participants, and users can send
-- messages only as themselves into conversations they participate in.
create policy "Participants can view messages"
  on public.messages
  for select
  to authenticated
  using (
    public.is_conversation_participant(conversation_id)
  );

create policy "Participants can send their own messages"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.is_conversation_participant(conversation_id)
  );


-- 7. Harden conversation creation.
create or replace function public.start_conversation(
  other_user_id uuid,
  p_job_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_id uuid;
  v_new_id uuid;
  v_job public.jobs%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if other_user_id is null or other_user_id = v_user_id then
    raise exception 'A valid, different recipient is required';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = other_user_id
  ) then
    raise exception 'Recipient does not exist';
  end if;

  if p_job_id is not null then
    select *
    into v_job
    from public.jobs j
    where j.id = p_job_id;

    if not found then
      raise exception 'Job does not exist';
    end if;

    if v_job.accepted_professional_id is null then
      raise exception 'This job does not have an accepted professional';
    end if;

    if v_user_id <> v_job.customer_id
       and v_user_id <> v_job.accepted_professional_id then
      raise exception 'You are not authorized to message about this job';
    end if;

    if other_user_id <> v_job.customer_id
       and other_user_id <> v_job.accepted_professional_id then
      raise exception 'Recipient is not a party to this job';
    end if;
  end if;

  -- Preserve existing conversation-reuse behavior.
  -- A request without a job ID can reuse an existing conversation
  -- between the two users; a job-linked request matches that job.
  select c.id
  into v_existing_id
  from public.conversations c
  where (p_job_id is null or c.job_id = p_job_id)
    and exists (
      select 1
      from public.conversation_participants cp1
      where cp1.conversation_id = c.id
        and cp1.user_id = v_user_id
    )
    and exists (
      select 1
      from public.conversation_participants cp2
      where cp2.conversation_id = c.id
        and cp2.user_id = other_user_id
    )
  limit 1;

  if v_existing_id is not null then
    return v_existing_id;
  end if;

  insert into public.conversations (job_id)
  values (p_job_id)
  returning id into v_new_id;

  insert into public.conversation_participants (conversation_id, user_id)
  values
    (v_new_id, v_user_id),
    (v_new_id, other_user_id);

  return v_new_id;
end;
$$;

revoke all on function public.start_conversation(uuid, uuid)
  from public, anon;

grant execute on function public.start_conversation(uuid, uuid)
  to authenticated;

commit;