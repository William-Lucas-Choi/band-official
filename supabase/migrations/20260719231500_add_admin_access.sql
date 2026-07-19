-- Run after create_live_events.sql.
-- This creates an allow-list of Supabase Auth users who may manage live events.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

grant usage on schema public to authenticated;
grant select on public.admin_users to authenticated;

create policy "Users can read their own admin record"
  on public.admin_users
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.live_events to authenticated;

create policy "Band admins can manage live events"
  on public.live_events
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );
