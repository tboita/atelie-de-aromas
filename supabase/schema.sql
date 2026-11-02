-- Ateliê de Aromas: rode uma vez no SQL Editor do Supabase.
-- Quatro tabelas com prefixo atelie_ para conviver com outros apps no mesmo projeto.

create table if not exists atelie_receitas (
  id text primary key,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);
create table if not exists atelie_estoque (
  id text primary key,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);
create table if not exists atelie_compras (
  id text primary key,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);
create table if not exists atelie_diario (
  id text primary key,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);

create table if not exists atelie_velas (
  id text primary key,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);

alter table atelie_receitas enable row level security;
alter table atelie_estoque  enable row level security;
alter table atelie_compras  enable row level security;
alter table atelie_diario   enable row level security;
alter table atelie_velas    enable row level security;

-- Mesmo padrão dos apps pessoais: uso individual, sem login.
create policy "acesso_total" on atelie_receitas for all using (true) with check (true);
create policy "acesso_total" on atelie_estoque  for all using (true) with check (true);
create policy "acesso_total" on atelie_compras  for all using (true) with check (true);
create policy "acesso_total" on atelie_diario   for all using (true) with check (true);
create policy "acesso_total" on atelie_velas    for all using (true) with check (true);
