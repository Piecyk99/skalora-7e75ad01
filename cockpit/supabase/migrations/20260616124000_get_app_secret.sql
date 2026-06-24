-- Generyczny odczyt sekretu aplikacyjnego z Vault dla Edge Functions (np. RESEND_API_KEY,
-- RESEND_FROM, BOOKING_URL). Tylko service_role — nie wycieka do frontu.
create or replace function public.get_app_secret(p_name text)
returns text
language sql
security definer
set search_path = public, vault, extensions
as $$
  select decrypted_secret from vault.decrypted_secrets where name = p_name limit 1;
$$;

revoke all on function public.get_app_secret(text) from public;
revoke all on function public.get_app_secret(text) from anon;
revoke all on function public.get_app_secret(text) from authenticated;
grant execute on function public.get_app_secret(text) to service_role;
