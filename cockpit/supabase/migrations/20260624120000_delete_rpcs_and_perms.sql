-- Faza: usuwanie prospektów i partner_leads (sprzątanie testów + zarządzanie).
-- Zapis do prospects normalnie tylko przez service_role; te RPC dają bezpieczną,
-- audytowaną ścieżkę usuwania dla admina (wszystko) i handlowca (swoje).
-- outreach ma FK ON DELETE CASCADE do obu tabel; consents (zapis prawny) NIE są ruszane.

-- Uprawnienie do usuwania prospektów: admin + handlowiec_pozysk.
insert into public.role_permissions (role, permission_key) values
  ('admin', 'prospects.delete'),
  ('handlowiec_pozysk', 'prospects.delete')
on conflict do nothing;

-- Usunięcie prospektu — admin lub handlowiec. Promowanego (powiązanego z leadem)
-- nie usuwamy: najpierw trzeba usunąć/odłączyć firmę z pipeline.
create or replace function public.rpc_delete_prospect(p_id uuid)
returns uuid
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
    raise exception 'Brak uprawnień do usunięcia prospektu' using errcode='42501';
  end if;

  select * into v_row from public.prospects where id = p_id for update;
  if not found then raise exception 'Prospekt % nie istnieje', p_id using errcode='P0002'; end if;

  if v_row.status = 'promowany' or v_row.promoted_to_lead is not null then
    raise exception 'Nie można usunąć promowanego prospektu — usuń najpierw powiązaną firmę z pipeline.'
      using errcode='23503';
  end if;

  perform public.log_activity('prospect', p_id, 'deleted', v_row.firma_nazwa, null, v_actor);
  delete from public.prospects where id = p_id;  -- outreach: ON DELETE CASCADE
  return p_id;
end;
$$;

-- Usunięcie firmy z pipeline — admin (dowolna) lub handlowiec (tylko swoja: assigned_to).
-- Cofa promocję źródłowego prospektu (status -> 'zakwalifikowany', promoted_to_lead = null),
-- żeby prospekt wrócił na listę zamiast zostać sierotą ze statusem 'promowany'.
create or replace function public.rpc_delete_partner_lead(p_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row   public.partner_leads;
  v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Brak uwierzytelnienia' using errcode='28000'; end if;

  select * into v_row from public.partner_leads where id = p_id for update;
  if not found then raise exception 'Firma % nie istnieje', p_id using errcode='P0002'; end if;

  if not (public.is_admin() or v_row.assigned_to = v_actor) then
    raise exception 'Brak uprawnień do usunięcia tej firmy' using errcode='42501';
  end if;

  if v_row.prospect_id is not null then
    update public.prospects
      set status = 'zakwalifikowany', promoted_to_lead = null
      where id = v_row.prospect_id and status = 'promowany';
  end if;

  perform public.log_activity('partner_lead', p_id, 'deleted', v_row.firma_nazwa, null, v_actor);
  delete from public.partner_leads where id = p_id;  -- outreach: ON DELETE CASCADE
  return p_id;
end;
$$;

grant execute on function public.rpc_delete_prospect(uuid) to authenticated;
grant execute on function public.rpc_delete_partner_lead(uuid) to authenticated;
