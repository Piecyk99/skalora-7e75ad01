-- KROK Faza 3b: cykl draftów outreach. Drafty tworzy agent-copywriter (service_role).
-- UI może edytować i AKCEPTOWAĆ draft — ale NIE wysyła (brak ścieżki 'sent' z frontu).

-- Edycja draftu (temat/treść) — tylko w stanie 'draft'. Admin/handlowiec.
create or replace function public.rpc_update_outreach(
  p_id uuid,
  p_temat text,
  p_tresc text
)
returns public.outreach
language plpgsql
security definer
set search_path = public
as $$
declare v_row public.outreach; v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Brak uwierzytelnienia' using errcode='28000'; end if;
  if not (public.is_admin() or public.current_user_has_role('handlowiec_pozysk')) then
    raise exception 'Brak uprawnień' using errcode='42501';
  end if;
  select * into v_row from public.outreach where id = p_id for update;
  if not found then raise exception 'Outreach % nie istnieje', p_id using errcode='P0002'; end if;
  if v_row.status <> 'draft' then raise exception 'Edycja tylko draftu (stan=%)', v_row.status using errcode='23514'; end if;

  update public.outreach set temat = p_temat, tresc = p_tresc where id = p_id returning * into v_row;
  perform public.log_activity('outreach', p_id, 'updated', null, null, v_actor);
  return v_row;
end;
$$;

-- Akceptacja draftu -> 'approved' (+ approved_by). NIE wysyła. Admin/handlowiec.
create or replace function public.rpc_approve_outreach(p_id uuid)
returns public.outreach
language plpgsql
security definer
set search_path = public
as $$
declare v_row public.outreach; v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Brak uwierzytelnienia' using errcode='28000'; end if;
  if not (public.is_admin() or public.current_user_has_role('handlowiec_pozysk')) then
    raise exception 'Brak uprawnień' using errcode='42501';
  end if;
  select * into v_row from public.outreach where id = p_id for update;
  if not found then raise exception 'Outreach % nie istnieje', p_id using errcode='P0002'; end if;
  if v_row.status <> 'draft' then raise exception 'Akceptować można tylko draft (stan=%)', v_row.status using errcode='23514'; end if;

  update public.outreach set status = 'approved', approved_by = v_actor where id = p_id returning * into v_row;
  perform public.log_activity('outreach', p_id, 'status_change', 'draft', 'approved', v_actor);
  return v_row;
end;
$$;
-- Świadomie BRAK rpc_send_outreach — wysyłka to osobna, późniejsza faza (SMTP + 'sent').

grant execute on function public.rpc_update_outreach(uuid, text, text) to authenticated;
grant execute on function public.rpc_approve_outreach(uuid) to authenticated;
