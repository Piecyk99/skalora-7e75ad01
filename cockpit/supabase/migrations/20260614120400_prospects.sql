-- KROK 1: prospects — strefa lądowania agenta-prospektora (na start PUSTA).
-- Zapisywane wyłącznie przez przyszłego agenta (service_role), nie z frontu.
create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  firma_nazwa text not null,
  nip text,
  zrodlo text,
  icp_score numeric,
  raw_data jsonb not null default '{}'::jsonb,
  status public.prospect_status not null default 'nowy',
  promoted_to_lead uuid,            -- FK do partner_leads dodany po jego utworzeniu
  created_at timestamptz not null default now()
);

create index if not exists prospects_status_idx on public.prospects (status);
create index if not exists prospects_nip_idx on public.prospects (nip);
