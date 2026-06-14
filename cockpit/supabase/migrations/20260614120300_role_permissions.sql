-- KROK 1: role_permissions — klucze uprawnień (permission keys), NIE role-stringi w kodzie.
-- UI/logika sprawdza permission_key, nie nazwę roli.
create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role public.app_role not null,
  permission_key text not null,
  unique (role, permission_key)
);

create index if not exists role_permissions_role_idx on public.role_permissions (role);

-- Funkcja pomocnicza: czy bieżący user ma dany permission_key (przez którąkolwiek rolę).
create or replace function public.current_user_has_permission(_permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role = ur.role
    where ur.user_id = auth.uid()
      and rp.permission_key = _permission_key
  );
$$;

grant execute on function public.current_user_has_permission(text) to authenticated;
