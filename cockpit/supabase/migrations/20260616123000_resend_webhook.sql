-- Webhook Resend: statusy bounced/complained z dostawcy + ręczne oznaczanie odpowiedzi.
-- Webhook (Edge Function, verify_jwt=false) uwierzytelnia się podpisem Svix; sekret w Vault.

-- ID wiadomości u dostawcy (Resend) — po nim webhook dopasowuje zdarzenie do outreachu.
alter table public.outreach add column if not exists provider_message_id text;
create index if not exists outreach_provider_msg_idx on public.outreach (provider_message_id);

-- Odczyt sekretu podpisu webhooka Resend. Tylko service_role (webhook porównuje podpis).
create or replace function public.get_resend_webhook_secret()
returns text
language sql
security definer
set search_path = public, vault, extensions
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'RESEND_WEBHOOK_SECRET' limit 1;
$$;
revoke all on function public.get_resend_webhook_secret() from public;
revoke all on function public.get_resend_webhook_secret() from anon;
revoke all on function public.get_resend_webhook_secret() from authenticated;
grant execute on function public.get_resend_webhook_secret() to service_role;

-- Ręczne oznaczenie odpowiedzi (Resend nie dostarcza 'replied' webhookiem). Tylko pracownik.
create or replace function public.rpc_mark_outreach_replied(p_id uuid)
returns public.outreach
language plpgsql
security definer
set search_path = public
as $$
declare v public.outreach; v_old public.outreach_status;
begin
  if not public.current_user_is_staff() then
    raise exception 'Brak uprawnień' using errcode='42501';
  end if;
  select status into v_old from public.outreach where id = p_id;
  if not found then raise exception 'Outreach % nie istnieje', p_id using errcode='P0002'; end if;
  if v_old not in ('sent','bounced') then
    raise exception 'Odpowiedź można oznaczyć tylko dla wysłanego maila (stan=%)', v_old using errcode='P0001';
  end if;
  update public.outreach set status='replied' where id = p_id returning * into v;
  insert into public.outreach_events (outreach_id, event_type, meta)
    values (p_id, 'replied', jsonb_build_object('source','manual'));
  insert into public.activity_log (entity_type, entity_id, event_type, old_value, new_value, actor_id)
    values ('outreach', p_id, 'status_change', v_old::text, 'replied', auth.uid());
  return v;
end;
$$;
grant execute on function public.rpc_mark_outreach_replied(uuid) to authenticated;
