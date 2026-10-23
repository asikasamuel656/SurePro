# SurePro Security & RLS Review

Written review for Phase 12 ("Security review", "RLS review"). This isn't
new code — it's an audit of what's already in place across
`supabase/migrations/0001` through `0010`.

## Credential handling

- The frontend only ever uses `VITE_SUPABASE_ANON_KEY` (`src/lib/supabase.js`).
  The service-role key never appears in any client file, `.env.example`, or
  build output — confirmed by grep across `src/`.
- `.env` is gitignored. `.env.example` contains only placeholder values.

## Row Level Security — table by table

Every table below has `alter table ... enable row level security` and no
table is left with RLS disabled.

| Table | Who can read | Who can write |
|---|---|---|
| `profiles` | any authenticated user (needed for public profile display) | only the row owner (+ admins) |
| `professionals` | any authenticated user | only the owning professional (+ admins for verification) |
| `categories`, `badges` | any authenticated user | nobody from the frontend (seeded via migration only) |
| `services`, `portfolio_items` | any authenticated user | only the owning professional |
| `reviews` | any authenticated user | insert/update only by the reviewing customer; **rating aggregate is recalculated by a trigger**, never written directly by the client |
| `professional_badges` | any authenticated user | nobody from the frontend — awarding is server-side only |
| `posts`, `post_media` | any authenticated user | only the owning professional (+ admin delete) |
| `reactions`, `comments`, `saved_posts` | any authenticated user (reactions/comments); owner-only (saved_posts) | only the acting user, for their own rows |
| `follows`, `saved_professionals` | any authenticated user (follows); owner-only (saved) | only the acting user |
| `jobs` | the customer, the accepted professional, or any professional while `open`/`quoted` (+ admins) | insert: the customer only. update: the customer (their own job) or the accepted professional (status progression only) |
| `quotes` | the job's customer + the quoting professional | insert: any professional on an open/quoted job. update: the job's customer (accept/decline) or the quoting professional (withdraw) |
| `job_status_events` | follows job visibility | nobody directly — populated by trigger only |
| `job_photos` | the job's customer + accepted professional | same two, insert only |
| `job_tracking` | the job's customer + accepted professional | **only** the accepted professional, and **only** while job status is `on_the_way`/`arrived`/`in_progress` — enforced in the RLS policy itself, not just the UI |
| `conversations`, `conversation_participants` | participants only | no direct insert policy — creation only via the `start_conversation()` security-definer function |
| `messages` | conversation participants | insert only by a participant, as themselves |
| `notifications` | the owning user only | no insert policy at all — every row comes from a trigger |
| `reports`, `support_tickets` | the filer only (+ admins) | insert only, by the filer; update reserved for admins |
| `blocks` | the blocker only | the blocker only |
| `saved_professionals` | owner only | owner only |

## Server-authoritative data

Three places explicitly follow the "reputation/status can't be faked by the
client" rule from the product brief:

1. **`professionals.rating`** — recalculated by `recalculate_professional_rating()`
   on every review insert/update/delete. No RLS policy lets a client set it directly.
2. **`job_status_events`** — the "job passport" — populated entirely by triggers
   on `jobs` insert/update, not by direct client writes.
3. **`notifications`** — every row is created by a trigger reacting to a real
   event (new quote, message, follow, review, like, comment, job status
   change). There is no insert policy, so nothing can fabricate a notification.

## Known limitations (intentional, tied to product decisions)

- **Reviews aren't yet gated to "you actually hired this person"** — that
  requires the completed-job link, which was called out explicitly back in
  Phase 5/6 as a temporary simplification.
- **No escrow, by design** — nothing in the schema holds funds; payment is
  off-platform between customer and professional per the product brief.
- **`is_admin` has no frontend write path** — it's set directly in the
  Supabase SQL editor, intentionally, so there's no way to self-promote
  through the app.

## Recommended before real production traffic

- Rate limiting on `support_tickets`/`reports` inserts (currently unlimited
  per user) to prevent spam — best done via a Supabase Edge Function or
  database trigger if this becomes a problem.
- Periodic review of the `reports` queue via `/admin/reports` (built in
  Phase 11) rather than ad hoc.