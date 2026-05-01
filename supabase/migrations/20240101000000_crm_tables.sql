create table if not exists leads (
  id bigint primary key generated always as identity,
  name text not null,
  email text not null,
  phone text not null,
  company_stage text,
  growth_blocker text,
  source text default 'landing_page',
  status text not null default 'new',
  assigned_to text,
  notes_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists notes (
  id bigint primary key generated always as identity,
  lead_id bigint not null references leads(id) on delete cascade,
  content text not null,
  author text default 'agent',
  created_at timestamptz default now()
);

create table if not exists activities (
  id bigint primary key generated always as identity,
  lead_id bigint not null references leads(id) on delete cascade,
  type text not null,
  description text,
  created_at timestamptz default now()
);

alter table leads enable row level security;
alter table notes enable row level security;
alter table activities enable row level security;

create policy "allow all" on leads for all using (true) with check (true);
create policy "allow all" on notes for all using (true) with check (true);
create policy "allow all" on activities for all using (true) with check (true);
