-- Odczyt sekretu ANTHROPIC_API_KEY z Vault dla Edge Functions (prospector/copywriter).
-- Tylko service_role może wywołać; anon/authenticated odcięte — klucz nie wycieka do frontu.
create or replace function public.get_anthropic_key()
returns text
language sql
security definer
set search_path = public, vault, extensions
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'ANTHROPIC_API_KEY' limit 1;
$$;

revoke all on function public.get_anthropic_key() from public;
revoke all on function public.get_anthropic_key() from anon;
revoke all on function public.get_anthropic_key() from authenticated;
grant execute on function public.get_anthropic_key() to service_role;
