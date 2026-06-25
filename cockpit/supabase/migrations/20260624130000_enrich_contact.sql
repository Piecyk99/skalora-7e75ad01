-- Enrichment kontaktów: kolumna www na firmie + przeniesienie www przy promocji prospektu.
alter table public.partner_leads add column if not exists www text;

-- Promocja prospekta przenosi e-mail/telefon/osoba ORAZ www z raw_data na leada.
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

  insert into public.partner_leads (firma_nazwa, nip, osoba_kontakt, email, telefon, www, status, assigned_to, source, prospect_id)
  values (
    v_prospect.firma_nazwa,
    v_prospect.nip,
    nullif(trim(v_prospect.raw_data->>'osoba_kontakt'), ''),
    nullif(trim(v_prospect.raw_data->>'email'), ''),
    nullif(trim(v_prospect.raw_data->>'telefon'), ''),
    nullif(trim(v_prospect.raw_data->>'www'), ''),
    'nowy', v_actor, 'prospect', p_id
  )
  returning * into v_lead;

  update public.prospects
    set status = 'promowany', promoted_to_lead = v_lead.id
    where id = p_id;

  perform public.log_activity('partner_lead', v_lead.id, 'created', null, v_lead.firma_nazwa, v_actor);
  perform public.log_activity('prospect', p_id, 'status_change', v_prospect.status::text, 'promowany', v_actor);
  return v_lead;
end;
$$;

grant execute on function public.rpc_promote_prospect(uuid) to authenticated;
