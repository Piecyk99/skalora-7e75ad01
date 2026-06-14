-- KROK 3: atomowe utworzenie partner_lead (source='reczny') wraz z zapisem zgód RODO
-- i wpisem audytu. Consents/activity_log są zapisywane WYŁĄCZNIE przez RPC, dlatego
-- formularz ręczny przechodzi tędy zamiast robić surowy INSERT z frontu.
create or replace function public.rpc_create_partner_lead(
  p_firma_nazwa text,
  p_nip text default null,
  p_osoba_kontakt text default null,
  p_email text default null,
  p_telefon text default null,
  p_next_action_date date default null,
  p_next_action_type text default null,
  p_kontrakt_wartosc numeric default null,
  p_prowizja_pct numeric default null,
  p_consent_wdrozenie boolean default false,
  p_consent_finansowanie boolean default false,
  p_consent_tresc text default null,
  p_consent_wersja text default 'v1'
)
returns public.partner_leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead  public.partner_leads;
  v_actor uuid := auth.uid();
begin
  if v_actor is null then
    raise exception 'Brak uwierzytelnienia' using errcode = '28000';
  end if;

  -- Tylko pracownik z odpowiednią rolą.
  if not (public.is_admin() or public.current_user_has_role('handlowiec_pozysk')) then
    raise exception 'Brak uprawnień do dodania firmy' using errcode = '42501';
  end if;

  if coalesce(trim(p_firma_nazwa), '') = '' then
    raise exception 'Nazwa firmy jest wymagana' using errcode = '23514';
  end if;

  -- RODO: dodanie firmy wymaga zgody na cel wdrożenia CRM.
  if not p_consent_wdrozenie then
    raise exception 'Wymagana zgoda RODO na wdrożenie CRM' using errcode = '23514';
  end if;
  if coalesce(trim(p_email), '') = '' then
    raise exception 'E-mail kontaktu jest wymagany do zapisania zgody RODO' using errcode = '23514';
  end if;

  insert into public.partner_leads (
    firma_nazwa, nip, osoba_kontakt, email, telefon,
    status, assigned_to, next_action_date, next_action_type,
    kontrakt_wartosc, prowizja_pct, source
  ) values (
    p_firma_nazwa, p_nip, p_osoba_kontakt, p_email, p_telefon,
    'nowy', v_actor, p_next_action_date, p_next_action_type,
    p_kontrakt_wartosc, p_prowizja_pct, 'reczny'
  )
  returning * into v_lead;

  -- Zgody RODO (dwucelowe). Zawsze wdrozenie_crm; finansowanie opcjonalnie.
  insert into public.consents (subject_email, cel, tresc_klauzuli, wersja, zrodlo)
  values (p_email, 'wdrozenie_crm',
          coalesce(p_consent_tresc, 'Zgoda na kontakt w sprawie wdrożenia CRM'),
          p_consent_wersja, 'cockpit_form');

  if p_consent_finansowanie then
    insert into public.consents (subject_email, cel, tresc_klauzuli, wersja, zrodlo)
    values (p_email, 'finansowanie',
            coalesce(p_consent_tresc, 'Zgoda na kontakt w sprawie finansowania'),
            p_consent_wersja, 'cockpit_form');
  end if;

  perform public.log_activity('partner_lead', v_lead.id, 'created', null, v_lead.firma_nazwa, v_actor);

  return v_lead;
end;
$$;

grant execute on function public.rpc_create_partner_lead(
  text, text, text, text, text, date, text, numeric, numeric, boolean, boolean, text, text
) to authenticated;
