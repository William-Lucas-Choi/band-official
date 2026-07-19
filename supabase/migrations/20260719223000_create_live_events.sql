-- Run this file in Supabase SQL Editor before adding live-event content.
-- Public visitors can only read published events. Admin write access will be
-- added separately with Supabase Auth and server-side authorization.

create extension if not exists pgcrypto;

create table if not exists public.live_events (
  id uuid primary key default gen_random_uuid(),
  calendar_event_id text unique,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text not null,
  city text not null default '',
  description text not null default '',
  ticket_url text,
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists live_events_published_starts_at_idx
  on public.live_events (starts_at asc)
  where published = true;

alter table public.live_events enable row level security;

grant usage on schema public to anon, authenticated;
grant select on table public.live_events to anon, authenticated;

drop policy if exists "Published live events are publicly readable" on public.live_events;
create policy "Published live events are publicly readable"
  on public.live_events
  for select
  to anon, authenticated
  using (published = true);
