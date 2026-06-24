-- KROK Faza outreach-send: wysyłka + tracking. Kolumny na outreach + tabela zdarzeń.
-- Wysyłka i tracking wykonują Edge Functions (service_role). UI tylko czyta.

alter table public.outreach add column if not exists recipient_email text;
alter table public.outreach add column if not exists opened_at timestamptz;
alter table public.outreach add column if not exists clicked_at timestamptz;
alter table public.outreach add column if not exists open_count integer not null default 0;
alter table public.outreach add column if not exists click_count integer not null default 0;
alter table public.outreach add column if not exists last_error text;

-- Zdarzenia outreach (sent/open/click/error). Zapis tylko przez funkcje (service_role).
create table if not exists public.outreach_events (
  id uuid primary key default gen_random_uuid(),
  outreach_id uuid not null references public.outreach (id) on delete cascade,
  event_type text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists outreach_events_outreach_idx on public.outreach_events (outreach_id);

alter table public.outreach_events enable row level security;
revoke all on public.outreach_events from anon, authenticated;
grant select on public.outreach_events to authenticated;

drop policy if exists outreach_events_select on public.outreach_events;
create policy outreach_events_select on public.outreach_events
  for select to authenticated
  using (public.current_user_is_staff());
-- brak insert/update/delete => zapis wyłącznie service_role (funkcje send/track).

-- Helper inkrementacji liczników (security definer; wołany przez track-* przez RPC service_role).
create or replace function public.bump_outreach_metric(_id uuid, _kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if _kind = 'open' then
    update public.outreach set open_count = open_count + 1, opened_at = coalesce(opened_at, now()) where id = _id;
  elsif _kind = 'click' then
    update public.outreach set click_count = click_count + 1, clicked_at = coalesce(clicked_at, now()) where id = _id;
  end if;
  insert into public.outreach_events (outreach_id, event_type) values (_id, _kind);
end;
$$;
-- bez grantu execute dla authenticated — wołane tylko przez service_role w funkcjach.
