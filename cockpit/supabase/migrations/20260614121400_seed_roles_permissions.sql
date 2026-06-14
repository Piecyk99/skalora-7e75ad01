-- KROK 6: seed uprawnień (permission keys per rola) + bootstrap pierwszego admina.

-- Mapa rola -> permission_key. Kod sprawdza klucze, nie nazwy ról.
insert into public.role_permissions (role, permission_key) values
  -- admin: pełnia
  ('admin', 'partner_leads.view'),
  ('admin', 'partner_leads.create'),
  ('admin', 'partner_leads.edit'),
  ('admin', 'partner_leads.transition'),
  ('admin', 'partner_leads.delete'),
  ('admin', 'prospects.view'),
  ('admin', 'outreach.view'),
  ('admin', 'consents.view'),
  ('admin', 'activity_log.view'),
  ('admin', 'external_tasks.view'),
  ('admin', 'admin.manage_roles'),
  -- handlowiec_pozysk: prowadzenie pipeline'u
  ('handlowiec_pozysk', 'partner_leads.view'),
  ('handlowiec_pozysk', 'partner_leads.create'),
  ('handlowiec_pozysk', 'partner_leads.edit'),
  ('handlowiec_pozysk', 'partner_leads.transition'),
  ('handlowiec_pozysk', 'prospects.view'),
  ('handlowiec_pozysk', 'outreach.view'),
  ('handlowiec_pozysk', 'external_tasks.view'),
  -- viewer: read-only
  ('viewer', 'partner_leads.view'),
  ('viewer', 'prospects.view'),
  ('viewer', 'outreach.view'),
  ('viewer', 'external_tasks.view')
on conflict (role, permission_key) do nothing;

-- Seed admina po e-mailu (no-op jeśli user jeszcze się nie zarejestrował).
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'dpsolutionsbusiness@gmail.com'
on conflict (user_id, role) do nothing;

-- Bootstrap: nadanie sobie roli admin gdy w systemie nie ma jeszcze ŻADNEGO admina.
-- Bezpieczne — działa tylko dopóki nie istnieje admin. Po pierwszym użyciu blokuje się.
create or replace function public.bootstrap_first_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Musisz być zalogowany' using errcode = '28000';
  end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    raise exception 'Admin już istnieje — bootstrap zablokowany' using errcode = '42501';
  end if;
  insert into public.user_roles (user_id, role)
  values (v_uid, 'admin')
  on conflict (user_id, role) do nothing;
end;
$$;

grant execute on function public.bootstrap_first_admin() to authenticated;
