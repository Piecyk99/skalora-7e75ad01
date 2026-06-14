-- KROK 1: outreach — log maili (na start PUSTY, BEZ wysyłki).
-- Drafty tworzy przyszły agent-copywriter (service_role). Brak ścieżki "wyślij" w tej fazie.
create table if not exists public.outreach (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.prospects (id) on delete cascade,
  partner_lead_id uuid references public.partner_leads (id) on delete cascade,
  kierunek public.outreach_direction not null default 'wychodzacy',
  temat text,
  tresc text,
  status public.outreach_status not null default 'draft',
  approved_by uuid references public.profiles (id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists outreach_prospect_idx on public.outreach (prospect_id);
create index if not exists outreach_partner_lead_idx on public.outreach (partner_lead_id);
create index if not exists outreach_status_idx on public.outreach (status);
