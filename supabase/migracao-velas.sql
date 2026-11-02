-- Só para quem já rodou o schema.sql da versão anterior: cria a tabela das velas produzidas.
create table if not exists atelie_velas (
  id text primary key,
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);
alter table atelie_velas enable row level security;
create policy "acesso_total" on atelie_velas for all using (true) with check (true);
