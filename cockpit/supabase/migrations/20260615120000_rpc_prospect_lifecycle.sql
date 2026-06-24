-- KROK Faza 3: cykl życia prospektów (strefa agenta-prospektora).
-- Zapis do prospects normalnie tylko przez service_role (agent). Te RPC dają
-- bezpieczną, audytowaną ścieżkę dla UI/admina: ręczne dodanie, ocena, promocja do leada.

-- Dodanie prospektu ręcznie (test/seed) — admin lub handlowiec.
create or replace function public.rpc_add_prospect(
  p_firma_nazwa text,
  p_nip text default null,
  p_zrodlo text default 'reczny',
  p_raw_data jsonb default '{}'::jsonb
)
returns public.prospects
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row   public.prospects;
  v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Brak uwierzytelnienia' using errcode='28000'; end if;
  if not (public.is_admin() or public.current_user_has_role('handlowiec_pozysk')) then
    raise exception 'Brak uprawnień' using errcode='42501';
  end if;
  if coalesce(trim(p_firma_nazwa),'')='' then raise exception 'Nazwa firmy wymagana' using errcode='23514'; end if;

  insert into public.prospects (firma_nazwa, nip, zrodlo, raw_data, status)
  values (p_firma_nazwa, p_nip, p_zrodlo, coalesce(p_raw_data, '{}'::jsonb), 'nowy')
  returning * into v_row;

  perform public.log_activity('prospect', v_row.id, 'created', null, v_row.firma_nazwa, v_actor);
  return v_row;
end;
$$;

-- Kwalifikacja / odrzucenie + opcjonalny wynik ICP — admin lub handlowiec.
create or replace function public.rpc_set_prospect_status(
  p_id uuid,
  p_status public.prospect_status,
  p_score numeric default null
)
returns public.prospects
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.prospects;
  v_old public.prospect_status;
  v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Brak uwierzytelnienia' using errcode='28000'; end if;
  if not (public.is_admin() or public.current_user_has_role('handlowiec_pozysk')) then
    raise exception 'Brak uprawnień' using errcode='42501';
  end if;

  select * into v_row from public.prospects where id = p_id for update;
  if not found then raise exception 'Prospekt % nie istnieje', p_id using errcode='P0002'; end if;
  v_old := v_row.status;

  update public.prospects
    set status = p_status,
        icp_score = coalesce(p_score, icp_score)
    where id = p_id
    returning * into v_row;

  perform public.log_activity('prospect', p_id, 'status_change', v_old::text, p_status::text, v_actor);
  return v_row;
end;
$$;

-- Promocja prospektu do partner_leads (source='prospect'). Cold lead — bez zgody RODO
-- na tym etapie (zgoda zbierana przy pierwszym kontakcie/outreach). Admin lub handlowiec.
create or replace function public.rpc_promote_prospect(p_id uuid)
returns public.partner_leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prospect public.prospects;
  v_lead     public.partner_leads;
  v_actor    uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Brak uwierzytelnienia' using errcode='28000'; end if;
  if not (public.is_admin() or public.current_user_has_role('handlowiec_pozysk')) then
    raise exception 'Brak uprawnień' using errcode='42501';
  end if;

  select * into v_prospect from public.prospects where id = p_id for update;
  if not found then raise exception 'Prospekt % nie istnieje', p_id using errcode='P0002'; end if;
  if v_prospect.promoted_to_lead is not null then
    raise exception 'Prospekt już promowany do leada %', v_prospect.promoted_to_lead using errcode='23505';
  end if;

  insert into public.partner_leads (firma_nazwa, nip, status, assigned_to, source, prospect_id)
  values (v_prospect.firma_nazwa, v_prospect.nip, 'nowy', v_actor, 'prospect', p_id)
  returning * into v_lead;

  update public.prospects
    set status = 'promowany', promoted_to_lead = v_lead.id
    where id = p_id;

  perform public.log_activity('partner_lead', v_lead.id, 'created', null, v_lead.firma_nazwa, v_actor);
  perform public.log_activity('prospect', p_id, 'status_change', v_prospect.status::text, 'promowany', v_actor);
  return v_lead;
end;
$$;

grant execute on function public.rpc_add_prospect(text, text, text, jsonb) to authenticated;
grant execute on function public.rpc_set_prospect_status(uuid, public.prospect_status, numeric) to authenticated;
grant execute on function public.rpc_promote_prospect(uuid) to authenticated;
