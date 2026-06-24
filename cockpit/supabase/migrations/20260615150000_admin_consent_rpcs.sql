-- KROK domknięcia: zarządzanie rolami, reassign leada, zgody RODO. Wszystko przez RPC
-- (security definer) z gatingiem ról i audytem do activity_log.

-- Lista pracowników + ich role (panel admina, dropdown reassign). Tylko admin.
create or replace function public.rpc_list_staff()
returns table(id uuid, email text, full_name text, roles text[])
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Tylko admin' using errcode='42501'; end if;
  return query
    select p.id, p.email, p.full_name,
           coalesce(array_agg(ur.role::text order by ur.role::text) filter (where ur.role is not null), '{}')
    from public.profiles p
    left join public.user_roles ur on ur.user_id = p.id
    group by p.id, p.email, p.full_name
    order by p.email;
end;
$$;

-- Nadanie roli userowi po e-mailu. Tylko admin.
create or replace function public.rpc_grant_role(p_email text, p_role public.app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_uid uuid;
begin
  if not public.is_admin() then raise exception 'Tylko admin' using errcode='42501'; end if;
  select id into v_uid from auth.users where email = lower(trim(p_email));
  if v_uid is null then raise exception 'Nie ma usera o e-mailu %', p_email using errcode='P0002'; end if;
  insert into public.user_roles (user_id, role) values (v_uid, p_role) on conflict (user_id, role) do nothing;
  perform public.log_activity('user', v_uid, 'role_grant', null, p_role::text, auth.uid());
end;
$$;

-- Odebranie roli. Tylko admin. Blokada usunięcia ostatniego admina.
create or replace function public.rpc_revoke_role(p_email text, p_role public.app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_uid uuid;
begin
  if not public.is_admin() then raise exception 'Tylko admin' using errcode='42501'; end if;
  select id into v_uid from auth.users where email = lower(trim(p_email));
  if v_uid is null then raise exception 'Nie ma usera o e-mailu %', p_email using errcode='P0002'; end if;
  if p_role = 'admin' and (select count(*) from public.user_roles where role = 'admin') <= 1 then
    raise exception 'Nie można odebrać roli ostatniemu adminowi' using errcode='42501';
  end if;
  delete from public.user_roles where user_id = v_uid and role = p_role;
  perform public.log_activity('user', v_uid, 'role_revoke', p_role::text, null, auth.uid());
end;
$$;

-- Reassign leada do innego pracownika. Tylko admin.
create or replace function public.rpc_reassign_lead(p_lead_id uuid, p_assignee uuid)
returns public.partner_leads
language plpgsql
security definer
set search_path = public
as $$
declare v_lead public.partner_leads; v_old uuid;
begin
  if not public.is_admin() then raise exception 'Tylko admin' using errcode='42501'; end if;
  select assigned_to into v_old from public.partner_leads where id = p_lead_id;
  if not found then raise exception 'Lead % nie istnieje', p_lead_id using errcode='P0002'; end if;
  update public.partner_leads set assigned_to = p_assignee where id = p_lead_id returning * into v_lead;
  perform public.log_activity('partner_lead', p_lead_id, 'reassigned', v_old::text, p_assignee::text, auth.uid());
  return v_lead;
end;
$$;

-- Zapis zgody RODO dla adresu (dla cold-leadów z promocji). Admin/handlowiec.
create or replace function public.rpc_record_consent(
  p_email text,
  p_wdrozenie boolean default true,
  p_finansowanie boolean default false,
  p_tresc text default null,
  p_wersja text default 'v1'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_actor uuid := auth.uid(); v_n integer := 0; v_id uuid;
begin
  if v_actor is null then raise exception 'Brak uwierzytelnienia' using errcode='28000'; end if;
  if not (public.is_admin() or public.current_user_has_role('handlowiec_pozysk')) then
    raise exception 'Brak uprawnień' using errcode='42501';
  end if;
  if coalesce(trim(p_email),'')='' then raise exception 'E-mail wymagany' using errcode='23514'; end if;
  if p_wdrozenie then
    insert into public.consents (subject_email, cel, tresc_klauzuli, wersja, zrodlo)
    values (p_email, 'wdrozenie_crm', coalesce(p_tresc,'Zgoda na kontakt w sprawie wdrożenia CRM'), p_wersja, 'cockpit_manual')
    returning id into v_id;
    perform public.log_activity('consent', v_id, 'created', null, p_email, v_actor); v_n := v_n + 1;
  end if;
  if p_finansowanie then
    insert into public.consents (subject_email, cel, tresc_klauzuli, wersja, zrodlo)
    values (p_email, 'finansowanie', coalesce(p_tresc,'Zgoda na kontakt w sprawie finansowania'), p_wersja, 'cockpit_manual')
    returning id into v_id;
    perform public.log_activity('consent', v_id, 'created', null, p_email, v_actor); v_n := v_n + 1;
  end if;
  return v_n;
end;
$$;

-- Status zgód dla adresu (UI leada). Admin/handlowiec — bo SELECT na consents jest admin-only.
create or replace function public.rpc_lead_consents(p_email text)
returns table(wdrozenie boolean, finansowanie boolean)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.is_admin() or public.current_user_has_role('handlowiec_pozysk')) then
    raise exception 'Brak uprawnień' using errcode='42501';
  end if;
  return query
    select coalesce(bool_or(cel='wdrozenie_crm' and revoked_at is null), false),
           coalesce(bool_or(cel='finansowanie' and revoked_at is null), false)
    from public.consents where subject_email = p_email;
end;
$$;

grant execute on function public.rpc_list_staff() to authenticated;
grant execute on function public.rpc_grant_role(text, public.app_role) to authenticated;
grant execute on function public.rpc_revoke_role(text, public.app_role) to authenticated;
grant execute on function public.rpc_reassign_lead(uuid, uuid) to authenticated;
grant execute on function public.rpc_record_consent(text, boolean, boolean, text, text) to authenticated;
grant execute on function public.rpc_lead_consents(text) to authenticated;
