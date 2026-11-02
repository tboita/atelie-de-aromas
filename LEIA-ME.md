# Ateliê de Aromas · Velas da Memória (v2)

React + Vite + Supabase, PWA, deploy na Vercel.

## 1. Supabase
1. Abra o SQL Editor do projeto Supabase (pode ser um projeto já existente: as tabelas têm prefixo `atelie_`).
2. Cole e rode `supabase/schema.sql`.
3. Em Settings > API, copie a URL e a chave **anon** no formato antigo (`eyJ...`).

Se você já rodou o `schema.sql` da versão 2.0, rode só `supabase/migracao-velas.sql`.

## 2. Local
```
copy .env.example .env      (preencha URL e chave)
npm install
npm run build
npm run dev
```

## 3. Vercel
Importe o repositório do GitHub e cadastre as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## 4. Dados
Na primeira abertura, com a nuvem vazia, o app oferece dois caminhos:
- **Carregar dados iniciais do ateliê**: as 59 receitas, 36 itens de estoque, compras e diário que vinham no app original.
- **Restaurar cópia**: no app antigo, Estoque > Salvar cópia; no novo, Estoque > Restaurar cópia. Traz tudo o que foi alterado no celular.
