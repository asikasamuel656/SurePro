-- Part 4 hardening: notification preferences actually enforced, missing
-- notification events (job completed, review request, verification
-- update), and a storage bucket for real chat image attachments.

-- ---------------------------------------------------------------------
-- 1. Enforce notification_preferences instead of just storing them.
-- ---------------------------------------------------------------------
create or replace function public.create_notification(
  p_user_id uuid, p_type text, p_title text, p_body text, p_data jsonb default null, p_category text default 'jobs'
) returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_prefs jsonb;
begin
  select notification_preferences into v_prefs from public.profiles where id = p_user_id;

  -- Default to allowed if the category isn't recognized or prefs are null.
  if v_prefs is not null and v_prefs ? p_category and (v_prefs ->> p_category)::boolean is false then
    return;
  end if;

  insert into public.notifications (user_id, type, title, body, data)
  values (p_user_id, p_type, p_title, p_body, p_data);
end;
$$;

-- Re-point every existing notify_* trigger function at the categorized
-- create_notification -- same logic as before, just passing a category so
-- Settings toggles (jobs/messages/feed/marketing) actually take effect.
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
    format('You got a quote for "%s"', v_job_title),
    jsonb_build_object('job_id', new.job_id, 'quote_id', new.id), 'jobs'
  );
  return new;
end;
$$;

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
        format('You were accepted for "%s"', new.title),
        jsonb_build_object('job_id', new.id), 'jobs'
      );
    elsif new.status in ('on_the_way', 'arrived') then
      perform public.create_notification(
        new.customer_id,
        case when new.status = 'on_the_way' then 'professional_on_the_way' else 'professional_arrived' end,
        case when new.status = 'on_the_way' then 'Your pro is on the way' else 'Your pro has arrived' end,
        format('Update on "%s"', new.title),
        jsonb_build_object('job_id', new.id), 'jobs'
      );
    elsif new.status = 'completed' then
      -- Notify both sides: the customer gets a review nudge, the
      -- professional gets a completion confirmation.
      perform public.create_notification(
        new.customer_id, 'job_completed', 'Job completed',
        format('"%s" is complete -- leave a review to help others.', new.title),
        jsonb_build_object('job_id', new.id), 'reviews'
      );
      if new.accepted_professional_id is not null then
        perform public.create_notification(
          new.accepted_professional_id, 'job_completed', 'Job marked complete',
          format('"%s" is now complete.', new.title),
          jsonb_build_object('job_id', new.id), 'jobs'
        );
      end if;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_recipient uuid;
begin
  for v_recipient in
    select user_id from public.conversation_participants
    where conversation_id = new.conversation_id and user_id <> new.sender_id
  loop
    perform public.create_notification(
      v_recipient, 'new_message', 'New message',
      coalesce(new.content, 'Sent a photo'),
      jsonb_build_object('conversation_id', new.conversation_id), 'messages'
    );
  end loop;
  return new;
end;
$$;

create or replace function public.notify_new_follow()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_follower_name text;
begin
  select full_name into v_follower_name from public.profiles where id = new.follower_id;
  perform public.create_notification(
    new.followed_id, 'new_follow', 'New follower',
    format('%s started following you', coalesce(v_follower_name, 'Someone')),
    jsonb_build_object('follower_id', new.follower_id), 'feed'
  );
  return new;
end;
$$;

create or replace function public.notify_new_review()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.create_notification(
    new.professional_id, 'new_review', 'New review',
    format('You received a %s-star review', new.rating),
    jsonb_build_object('review_id', new.id), 'reviews'
  );
  return new;
end;
$$;

create or replace function public.notify_post_reaction()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner_id uuid;
  v_type text := tg_argv[0];
begin
  select professional_id into v_owner_id from public.posts where id = new.post_id;
  if v_owner_id is null or v_owner_id = coalesce(new.user_id, null) then
    return new;
  end if;
  perform public.create_notification(
    v_owner_id, v_type,
    case when v_type = 'new_like' then 'New like' else 'New comment' end,
    case when v_type = 'new_like' then 'Someone liked your post' else 'Someone commented on your post' end,
    jsonb_build_object('post_id', new.post_id), 'feed'
  );
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Verification-status-change notification (was entirely missing).
-- ---------------------------------------------------------------------
create or replace function public.notify_verification_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.verification_status is distinct from old.verification_status and new.verification_status = 'verified' then
    perform public.create_notification(
      new.id, 'verification_update', 'You''re verified!',
      'Your professional profile now shows a verified badge.',
      jsonb_build_object('professional_id', new.id), 'jobs'
    );
  end if;
  return new;
end;
$$;

create trigger professionals_notify_verification_change
  after update on public.professionals
  for each row
  execute function public.notify_verification_change();

-- ---------------------------------------------------------------------
-- 3. Storage bucket for real chat image attachments.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('messages', 'messages', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- messages/{conversation_id}/... -- write restricted to participants
create policy "Message images are publicly readable"
  on storage.objects for select
  to public
  using (bucket_id = 'messages');

create policy "Conversation participants can upload message images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'messages'
    and exists (
      select 1 from public.conversation_participants
      where conversation_participants.conversation_id::text = (storage.foldername(name))[1]
        and conversation_participants.user_id = auth.uid()
    )
  );