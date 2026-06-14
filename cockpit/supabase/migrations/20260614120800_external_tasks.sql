-- KROK 1: external_tasks — cache pod przyszły pull z EkoTechniki (na start PUSTY).
-- Synchronizacja read-only przez service_role; UNIQUE(source, external_id) = dedup.
create table if not exists public.external_tasks (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  tytul text,
  status text,
  due_date date,
  payload jsonb not null default '{}'::jsonb,
  synced_at timestamptz not null default now(),
  unique (source, external_id)
);

create index if not exists external_tasks_due_date_idx on public.external_tasks (due_date);
