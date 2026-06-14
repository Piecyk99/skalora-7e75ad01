-- KROK 1: consents — RODO od pierwszej fazy. Dwucelowe:
-- 'wdrozenie_crm' (pozysk/wdrożenie) oraz 'finansowanie' (przyszłe pośrednictwo).
-- Wpisy WYŁĄCZNIE przez RPC (service_role / security definer), nigdy z frontu.
create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  subject_email text not null,
  cel public.consent_cel not null,
  tresc_klauzuli text not null,
  wersja text not null,
  zrodlo text,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists consents_subject_email_idx on public.consents (subject_email);
create index if not exists consents_cel_idx on public.consents (cel);
