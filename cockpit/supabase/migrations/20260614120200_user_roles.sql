-- KROK 1: user_roles — junction additive RBAC (multi-role per user).
-- Jeden user może mieć wiele ról. Brak ról w profiles.
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index if not exists user_roles_user_id_idx on public.user_roles (user_id);

-- SSOT autoryzacji dla RLS. SECURITY DEFINER, żeby uniknąć rekurencji RLS na
-- user_roles (funkcja czyta tabelę z pominięciem polityk wywołującego).
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Wygodny wrapper dla bieżącego usera.
create or replace function public.current_user_has_role(_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), _role);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin');
$$;

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.current_user_has_role(public.app_role) to authenticated;
grant execute on function public.is_admin() to authenticated;
