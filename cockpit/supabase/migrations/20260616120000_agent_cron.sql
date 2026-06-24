-- Faza: automatyzacja agentów (pg_cron). Cron wywołuje Edge Functions prospector/copywriter
-- przez pg_net. Bearer = klucz publishable (i tak publiczny w buncie frontu) trzymany w Vault,
-- żeby rotacja była w jednym miejscu. Wywołania niedostępne dla klienta — tylko cron/admin RPC.

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Sekrety w Vault: bazowy URL funkcji + bearer. Idempotentnie.
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'edge_base_url') then
    perform vault.create_secret(
      'https://meactqtvjiztahuzgxqp.supabase.co/functions/v1',
      'edge_base_url', 'Bazowy URL Edge Functions (cron)');
  end if;
  if not exists (select 1 from vault.secrets where name = 'edge_bearer') then
    perform vault.create_secret(
      'sb_publishable_AoevzeKtZn-UIo8LSUSMBA_O6aBpPO-',
      'edge_bearer', 'Bearer (publishable key) do wywołań cron->Edge Function');
  end if;
end $$;

-- Wrapper: wywołanie funkcji brzegowej. SECURITY DEFINER (owner=postgres), odebrane klientom.
-- Wywołują go: cron (owner) oraz admin-RPC poniżej (też security definer).
create or replace function public.invoke_edge(p_fn text, p_body jsonb default '{}'::jsonb)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v_url text; v_bearer text; v_req bigint;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'edge_base_url';
  select decrypted_secret into v_bearer from vault.decrypted_secrets where name = 'edge_bearer';
  if v_url is null or v_bearer is null then
    raise exception 'Brak sekretów edge_base_url/edge_bearer w Vault' using errcode='P0001';
  end if;
  select net.http_post(
    url := v_url || '/' || p_fn,
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || v_bearer,
      'apikey', v_bearer),
    body := p_body
  ) into v_req;
  return v_req;
end;
$$;
revoke all on function public.invoke_edge(text, jsonb) from public, anon, authenticated;

-- Harmonogram. Czas w UTC (serwer). 02:00 UTC ~ 03/04 czasu PL.
-- Idempotentnie: zdejmij stare joby o tych nazwach, potem zaplanuj.
do $$
declare r record;
begin
  for r in select jobid from cron.job
           where jobname in ('agent-prospector-nightly','agent-copywriter-nightly') loop
    perform cron.unschedule(r.jobid);
  end loop;
end $$;

select cron.schedule('agent-prospector-nightly', '0 2 * * *',
  $$select public.invoke_edge('prospector', jsonb_build_object('limit', 25));$$);
select cron.schedule('agent-copywriter-nightly', '20 2 * * *',
  $$select public.invoke_edge('copywriter', jsonb_build_object('limit', 25));$$);

-- Admin: ręczne uruchomienie agenta „teraz".
create or replace function public.rpc_run_agent(p_fn text, p_limit integer default 25)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Tylko admin' using errcode='42501'; end if;
  if p_fn not in ('prospector','copywriter') then
    raise exception 'Nieznany agent %', p_fn using errcode='22023';
  end if;
  return public.invoke_edge(p_fn, jsonb_build_object('limit', greatest(1, least(coalesce(p_limit,25), 50))));
end;
$$;

-- Admin: podgląd ostatnich uruchomień cron dla naszych agentów.
create or replace function public.rpc_agent_runs()
returns table(jobname text, status text, return_message text, start_time timestamptz, end_time timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Tylko admin' using errcode='42501'; end if;
  return query
    select j.jobname, d.status, d.return_message, d.start_time, d.end_time
    from cron.job_run_details d
    join cron.job j on j.jobid = d.jobid
    where j.jobname in ('agent-prospector-nightly','agent-copywriter-nightly')
    order by d.start_time desc
    limit 20;
end;
$$;

grant execute on function public.rpc_run_agent(text, integer) to authenticated;
grant execute on function public.rpc_agent_runs() to authenticated;
