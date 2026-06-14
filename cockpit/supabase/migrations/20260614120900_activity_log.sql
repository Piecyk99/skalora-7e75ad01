-- KROK 1: activity_log — audit każdej zmiany stanu. Wpisy WYŁĄCZNIE przez RPC.
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  event_type text not null,
  old_value text,
  new_value text,
  actor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_entity_idx on public.activity_log (entity_type, entity_id);
create index if not exists activity_log_actor_idx on public.activity_log (actor_id);
create index if not exists activity_log_created_idx on public.activity_log (created_at desc);

-- Wewnętrzny helper audytu — wołany przez RPC (definer), nie z frontu.
create or replace function public.log_activity(
  _entity_type text,
  _entity_id uuid,
  _event_type text,
  _old_value text,
  _new_value text,
  _actor_id uuid
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.activity_log (entity_type, entity_id, event_type, old_value, new_value, actor_id)
  values (_entity_type, _entity_id, _event_type, _old_value, _new_value, _actor_id);
$$;
-- celowo BRAK grantu execute dla authenticated — log_activity wołają tylko inne
-- funkcje security definer (RPC), nie klient.
