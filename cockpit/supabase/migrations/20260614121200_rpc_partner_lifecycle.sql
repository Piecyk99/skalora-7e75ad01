-- KROK 3: SSOT cyklu życia partner_leads. JEDYNA dozwolona ścieżka zmiany status.
-- security definer + search_path=public. Waliduje przejście, autoryzację, audytuje.

-- Dozwolone przejścia statusów (graf pipeline'u).
create or replace function public.partner_status_can_transition(
  _from public.partner_status,
  _to public.partner_status
)
returns boolean
language sql
immutable
as $$
  select case _from
    when 'nowy'              then _to in ('kontakt', 'odrzucony')
    when 'kontakt'           then _to in ('demo_crm', 'odrzucony')
    when 'demo_crm'          then _to in ('umowa_wdrozeniowa', 'odrzucony')
    when 'umowa_wdrozeniowa' then _to in ('onboarding', 'odrzucony')
    when 'onboarding'        then _to in ('wygrany', 'odrzucony')
    when 'wygrany'           then false                    -- terminal
    when 'odrzucony'         then _to in ('nowy')          -- reaktywacja
    else false
  end;
$$;

create or replace function public.rpc_partner_lifecycle(
  p_lead_id uuid,
  p_new_status public.partner_status,
  p_note text default null
)
returns public.partner_leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead       public.partner_leads;
  v_old_status public.partner_status;
  v_actor      uuid := auth.uid();
begin
  if v_actor is null then
    raise exception 'Brak uwierzytelnienia' using errcode = '28000';
  end if;

  select * into v_lead from public.partner_leads where id = p_lead_id for update;
  if not found then
    raise exception 'Partner lead % nie istnieje', p_lead_id using errcode = 'P0002';
  end if;

  -- Autoryzacja: admin lub właściciel leada (definer omija RLS, więc sprawdzamy ręcznie).
  if not (public.is_admin() or v_lead.assigned_to = v_actor) then
    raise exception 'Brak uprawnień do zmiany statusu tego leada' using errcode = '42501';
  end if;

  -- No-op: ten sam status.
  if v_lead.status = p_new_status then
    return v_lead;
  end if;

  -- Walidacja dozwolonego przejścia.
  if not public.partner_status_can_transition(v_lead.status, p_new_status) then
    raise exception 'Niedozwolone przejście statusu: % -> %', v_lead.status, p_new_status
      using errcode = '23514';
  end if;

  v_old_status := v_lead.status;

  update public.partner_leads
    set status = p_new_status
    where id = p_lead_id
    returning * into v_lead;

  -- Audit (tylko przez RPC), z poprawnym starym i nowym stanem.
  perform public.log_activity(
    'partner_lead', p_lead_id, 'status_change',
    v_old_status::text,
    p_new_status::text,
    v_actor
  );

  return v_lead;
end;
$$;

grant execute on function public.rpc_partner_lifecycle(uuid, public.partner_status, text) to authenticated;
grant execute on function public.partner_status_can_transition(public.partner_status, public.partner_status) to authenticated;
