-- KROK 2: RLS deny-by-default + przywileje tabelaryczne.
-- Deny-by-default = enable RLS bez polityki = brak dostępu. Polityki w 121100.
-- Anon nie ma dostępu do niczego. authenticated dostaje wąsko przyznane przywileje;
-- dodatkowo musi przejść politykę RLS.

-- 1) Odbierz wszystko anonowi i authenticated na starcie (czysty deny baseline).
revoke all on all tables in schema public from anon, authenticated;

-- 2) Włącz RLS na każdej tabeli + wymuś ją także dla właściciela tam, gdzie to istotne.
alter table public.profiles          enable row level security;
alter table public.user_roles        enable row level security;
alter table public.role_permissions  enable row level security;
alter table public.prospects         enable row level security;
alter table public.partner_leads     enable row level security;
alter table public.outreach          enable row level security;
alter table public.consents          enable row level security;
alter table public.external_tasks    enable row level security;
alter table public.activity_log      enable row level security;

-- 3) Przywileje tabelaryczne dla authenticated (RLS i tak je dodatkowo zawęża).
grant select, update                 on public.profiles         to authenticated;
grant select, insert, update, delete on public.user_roles       to authenticated;
grant select, insert, update, delete on public.role_permissions to authenticated;
grant select                         on public.prospects        to authenticated;
grant select                         on public.outreach         to authenticated;
grant select                         on public.consents         to authenticated;
grant select                         on public.external_tasks   to authenticated;
grant select                         on public.activity_log     to authenticated;

-- partner_leads: SELECT/INSERT/DELETE + UPDATE TYLKO na kolumnach innych niż status.
-- Brak `status` na liście = front nie ma uprawnienia do UPDATE status. Status zmienia
-- wyłącznie rpc_partner_lifecycle (security definer, działa jako właściciel).
grant select, insert, delete on public.partner_leads to authenticated;
grant update (
  firma_nazwa, nip, osoba_kontakt, email, telefon,
  assigned_to, next_action_date, next_action_type,
  kontrakt_wartosc, prowizja_pct, updated_at
) on public.partner_leads to authenticated;

-- consents/activity_log: ZERO insert/update dla authenticated — wpis tylko przez RPC.
