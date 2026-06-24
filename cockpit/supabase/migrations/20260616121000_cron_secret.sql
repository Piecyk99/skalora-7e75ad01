-- Sekret do wewnętrznych wywołań cron -> Edge Function. Wartość trzymana w Vault
-- (ustawiana jednorazowo poza repo). Edge function porównuje nagłówek x-cron-secret
-- z tym sekretem; tylko service_role może go odczytać.
create or replace function public.get_cron_secret()
returns text
language sql
security definer
set search_path = public, vault, extensions
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'CRON_SECRET' limit 1;
$$;

revoke all on function public.get_cron_secret() from public;
revoke all on function public.get_cron_secret() from anon;
revoke all on function public.get_cron_secret() from authenticated;
grant execute on function public.get_cron_secret() to service_role;
