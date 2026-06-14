-- KROK 1: partner_leads — pipeline pozysku firm na wdrożenie CRM.
-- Method B comp: kontrakt_wartosc + prowizja_pct (% wartości kontraktu wdrożeniowego).
-- ŚWIADOMIE BRAK pola typu "udzial_w_prowizji_kredytowej" — to byłoby nielegalne
-- (mieszanie wynagrodzenia z pośrednictwem kredytowym). credit_clients = osobny projekt.
create table if not exists public.partner_leads (
  id uuid primary key default gen_random_uuid(),
  firma_nazwa text not null,
  nip text,
  osoba_kontakt text,
  email text,
  telefon text,
  status public.partner_status not null default 'nowy',
  assigned_to uuid references public.profiles (id) on delete set null,
  next_action_date date,
  next_action_type text,
  kontrakt_wartosc numeric,         -- Method B: wartość kontraktu wdrożeniowego
  prowizja_pct numeric,             -- Method B: % od wartości kontraktu
  source public.partner_source not null default 'reczny',
  prospect_id uuid references public.prospects (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_leads_assigned_to_idx on public.partner_leads (assigned_to);
create index if not exists partner_leads_status_idx on public.partner_leads (status);
create index if not exists partner_leads_next_action_idx on public.partner_leads (next_action_date);

-- Domknięcie cyklicznej referencji: prospects.promoted_to_lead -> partner_leads.id
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'prospects_promoted_to_lead_fkey'
  ) then
    alter table public.prospects
      add constraint prospects_promoted_to_lead_fkey
      foreign key (promoted_to_lead) references public.partner_leads (id) on delete set null;
  end if;
end $$;

-- updated_at automatycznie.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_partner_leads_updated_at on public.partner_leads;
create trigger trg_partner_leads_updated_at
  before update on public.partner_leads
  for each row execute function public.touch_updated_at();
