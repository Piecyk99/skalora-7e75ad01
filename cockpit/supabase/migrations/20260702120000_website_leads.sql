-- Leady ze strony skalora.pl (formularz kontaktowy) — osobny, inbound model.
-- Świadomie NIE wciskamy ich do partner_leads (inne pola: imię/etap firmy/bloker wzrostu,
-- brak firma_nazwa/NIP). Wpis wyłącznie przez edge function web-lead-intake (service_role).
create table if not exists public.website_leads (
  id uuid primary key default gen_random_uuid(),
  imie text,
  email text not null,
  telefon text,
  company_stage text,
  growth_blocker text,
  wiadomosc text,
  source text not null default 'skalora.pl',
  status text not null default 'nowy',
  assigned_to uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists website_leads_status_idx on public.website_leads (status);
create index if not exists website_leads_created_idx on public.website_leads (created_at desc);

alter table public.website_leads enable row level security;

-- SELECT: każdy pracownik (inbound kontakty widoczne dla zespołu).
drop policy if exists website_leads_select on public.website_leads;
create policy website_leads_select on public.website_leads
  for select to authenticated using (public.current_user_is_staff());

-- UPDATE: pracownik (zmiana statusu / przypisanie).
drop policy if exists website_leads_update on public.website_leads;
create policy website_leads_update on public.website_leads
  for update to authenticated using (public.current_user_is_staff()) with check (public.current_user_is_staff());

-- DELETE: admin.
drop policy if exists website_leads_delete on public.website_leads;
create policy website_leads_delete on public.website_leads
  for delete to authenticated using (public.is_admin());

-- INSERT: brak polityki => z frontu zablokowane; wpis wyłącznie service_role (edge function web-lead-intake).

-- updated_at trigger (reużycie public.touch_updated_at()).
drop trigger if exists trg_website_leads_updated_at on public.website_leads;
create trigger trg_website_leads_updated_at
  before update on public.website_leads
  for each row execute function public.touch_updated_at();
