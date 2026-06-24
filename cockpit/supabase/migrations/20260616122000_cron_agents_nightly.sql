-- Automatyzacja agentów: nocne uruchomienia prospectora i copywritera przez pg_cron + pg_net.
-- Obie funkcje wymagają autoryzacji; cron uwierzytelnia się nagłówkiem x-cron-secret, którego
-- wartość czytana jest w locie z Vault (sekret CRON_SECRET) — NIE jest zapisana w tym pliku.
-- Klucz 'apikey'/'Authorization' to PUBLICZNY klucz publishable (taki sam jak w buildzie frontu) —
-- przechodzi bramkę gateway (verify_jwt), a właściwą autoryzację robi x-cron-secret w funkcji.
--
-- Wymaga: extensions pg_cron + pg_net (włączone na projekcie), sekret CRON_SECRET w Vault.

-- prospector: codziennie 02:00 UTC — ocena ICP do 20 prospektów ze statusem 'nowy'.
select cron.schedule('skalora-prospector-nightly', '0 2 * * *', $job$
  select net.http_post(
    url := 'https://meactqtvjiztahuzgxqp.supabase.co/functions/v1/prospector',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'apikey','sb_publishable_AoevzeKtZn-UIo8LSUSMBA_O6aBpPO-',
      'Authorization','Bearer sb_publishable_AoevzeKtZn-UIo8LSUSMBA_O6aBpPO-',
      'x-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='CRON_SECRET')
    ),
    body := jsonb_build_object('limit',20),
    timeout_milliseconds := 120000
  );
$job$);

-- copywriter: codziennie 02:15 UTC — drafty maili dla do 20 leadów (nowy/kontakt) bez outreachu.
select cron.schedule('skalora-copywriter-nightly', '15 2 * * *', $job$
  select net.http_post(
    url := 'https://meactqtvjiztahuzgxqp.supabase.co/functions/v1/copywriter',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'apikey','sb_publishable_AoevzeKtZn-UIo8LSUSMBA_O6aBpPO-',
      'Authorization','Bearer sb_publishable_AoevzeKtZn-UIo8LSUSMBA_O6aBpPO-',
      'x-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='CRON_SECRET')
    ),
    body := jsonb_build_object('limit',20),
    timeout_milliseconds := 120000
  );
$job$);
