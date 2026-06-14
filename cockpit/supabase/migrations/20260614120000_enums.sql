-- Skalora cockpit DP DYNEX — KROK 1: ENUMY (osobna migracja)
-- Wszystkie typy enum tworzone tutaj, ZANIM którakolwiek migracja ich użyje.
-- Reguła projektu: ALTER TYPE ... ADD VALUE zawsze w osobnej migracji, nigdy w
-- tej samej co użycie. Tworzenie pełnego enuma (CREATE TYPE) jest bezpieczne.
-- Idempotentne przez guard na pg_type.

do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'handlowiec_pozysk', 'viewer');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'partner_status') then
    create type public.partner_status as enum (
      'nowy', 'kontakt', 'demo_crm', 'umowa_wdrozeniowa',
      'onboarding', 'wygrany', 'odrzucony'
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'partner_source') then
    create type public.partner_source as enum ('reczny', 'prospect', 'import');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'prospect_status') then
    create type public.prospect_status as enum (
      'nowy', 'zakwalifikowany', 'odrzucony', 'promowany'
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'outreach_status') then
    create type public.outreach_status as enum (
      'draft', 'approved', 'sent', 'bounced', 'replied'
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'outreach_direction') then
    create type public.outreach_direction as enum ('wychodzacy', 'przychodzacy');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'consent_cel') then
    create type public.consent_cel as enum ('wdrozenie_crm', 'finansowanie');
  end if;
end $$;
