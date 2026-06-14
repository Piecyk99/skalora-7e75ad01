-- KROK 2: Polityki RLS. Każda polityka ma realny predykat — ZERO using(true).

-- Helper: czy bieżący user jest pracownikiem (ma jakąkolwiek rolę).
create or replace function public.current_user_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid());
$$;
grant execute on function public.current_user_is_staff() to authenticated;

-- ============================ profiles ============================
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.current_user_is_staff());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ============================ user_roles ============================
drop policy if exists user_roles_select on public.user_roles;
create policy user_roles_select on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists user_roles_admin_write on public.user_roles;
create policy user_roles_admin_write on public.user_roles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================ role_permissions ============================
drop policy if exists role_permissions_select on public.role_permissions;
create policy role_permissions_select on public.role_permissions
  for select to authenticated
  using (public.current_user_is_staff());

drop policy if exists role_permissions_admin_write on public.role_permissions;
create policy role_permissions_admin_write on public.role_permissions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================ partner_leads ============================
-- SELECT: admin i viewer widzą wszystko; handlowiec tylko swoje.
drop policy if exists partner_leads_select on public.partner_leads;
create policy partner_leads_select on public.partner_leads
  for select to authenticated
  using (
    public.is_admin()
    or public.current_user_has_role('viewer')
    or assigned_to = auth.uid()
  );

-- INSERT: handlowiec (przypisany do siebie) lub admin.
drop policy if exists partner_leads_insert on public.partner_leads;
create policy partner_leads_insert on public.partner_leads
  for insert to authenticated
  with check (
    public.is_admin()
    or (public.current_user_has_role('handlowiec_pozysk') and assigned_to = auth.uid())
  );

-- UPDATE: admin pełny; handlowiec tylko swoje i nie może oddać leada (with check assigned_to = uid).
-- Zmiana kolumny status jest i tak niemożliwa (brak grantu kolumnowego) — tylko RPC.
drop policy if exists partner_leads_update_admin on public.partner_leads;
create policy partner_leads_update_admin on public.partner_leads
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists partner_leads_update_owner on public.partner_leads;
create policy partner_leads_update_owner on public.partner_leads
  for update to authenticated
  using (public.current_user_has_role('handlowiec_pozysk') and assigned_to = auth.uid())
  with check (public.current_user_has_role('handlowiec_pozysk') and assigned_to = auth.uid());

-- DELETE: tylko admin.
drop policy if exists partner_leads_delete_admin on public.partner_leads;
create policy partner_leads_delete_admin on public.partner_leads
  for delete to authenticated
  using (public.is_admin());

-- ============================ prospects (read-only z frontu) ============================
drop policy if exists prospects_select on public.prospects;
create policy prospects_select on public.prospects
  for select to authenticated
  using (public.current_user_is_staff());
-- brak insert/update/delete => zapis tylko service_role (przyszły agent).

-- ============================ outreach (read-only z frontu, bez wysyłki) ============================
drop policy if exists outreach_select on public.outreach;
create policy outreach_select on public.outreach
  for select to authenticated
  using (public.current_user_is_staff());
-- brak insert/update/delete => drafty tworzy service_role; brak ścieżki "wyślij".

-- ============================ consents (RODO, wrażliwe) ============================
drop policy if exists consents_select_admin on public.consents;
create policy consents_select_admin on public.consents
  for select to authenticated
  using (public.is_admin());
-- brak insert/update/delete => wpis wyłącznie przez rpc (security definer).

-- ============================ external_tasks (cache EkoTechnika) ============================
drop policy if exists external_tasks_select on public.external_tasks;
create policy external_tasks_select on public.external_tasks
  for select to authenticated
  using (public.current_user_is_staff());
-- brak insert/update/delete => sync przez service_role.

-- ============================ activity_log (audit) ============================
drop policy if exists activity_log_select on public.activity_log;
create policy activity_log_select on public.activity_log
  for select to authenticated
  using (public.is_admin() or actor_id = auth.uid());
-- brak insert => wpis wyłącznie przez log_activity (security definer).
