import { supabase } from './supabase.js'

export const COLECOES = ['receitas', 'estoque', 'compras', 'diario', 'velas']
const T = c => 'atelie_' + c
const CACHE = 'atelie-aromas-nuvem-v2'

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
const limpar = ({ id, ...d }) => d

/* Cópia local para abrir rápido e funcionar sem internet (somente leitura) */
export function lerCache() { try { return JSON.parse(localStorage.getItem(CACHE)) } catch { return null } }
export function gravarCache(d) { try { localStorage.setItem(CACHE, JSON.stringify(d)) } catch { /* sem espaço: ignora */ } }

export async function carregarTudo() {
  const out = {}
  await Promise.all(COLECOES.map(async c => {
    const { data, error } = await supabase.from(T(c)).select('id,dados')
    if (error) throw error
    out[c] = data.map(r => ({ ...r.dados, id: r.id }))
  }))
  return out
}

export async function gravar(c, item) {
  const { error } = await supabase.from(T(c)).upsert({ id: item.id, dados: limpar(item), atualizado_em: new Date().toISOString() })
  if (error) throw error
}

export async function apagar(c, id) {
  const { error } = await supabase.from(T(c)).delete().eq('id', id)
  if (error) throw error
}

/* Restaurar cópia: substitui as coleções presentes no arquivo. Aceita o formato do app antigo ({colecao:{id:dados}}).
   Coleções ausentes (ex.: velas numa cópia do app antigo) ficam como estão. */
export async function substituirTudo(dados) {
  const novo = {}
  for (const c of COLECOES) {
    if (!(c in dados)) continue
    const fonte = dados[c] || {}
    const lista = Array.isArray(fonte) ? fonte.map(x => ({ ...x, id: x.id || uid() })) : Object.entries(fonte).map(([id, d]) => ({ ...d, id }))
    const del = await supabase.from(T(c)).delete().neq('id', '')
    if (del.error) throw del.error
    for (let i = 0; i < lista.length; i += 200) {
      const lote = lista.slice(i, i + 200).map(x => ({ id: x.id, dados: limpar(x) }))
      const { error } = await supabase.from(T(c)).insert(lote)
      if (error) throw error
    }
    novo[c] = lista
  }
  return novo
}

/* Novidades dos dados iniciais: entram sozinhas na nuvem uma única vez, sem apagar nada */
export const VERSAO_DADOS = 4
const NOVIDADES = [
  /* v4: completa a nuvem com todos os dados do ateliê que ainda não estiverem lá */
  { v: 4, c: 'receitas', todos: true }, { v: 4, c: 'estoque', todos: true }, { v: 4, c: 'compras', todos: true },
  { v: 4, c: 'diario', todos: true }, { v: 4, c: 'velas', todos: true },
  { v: 3, c: 'velas', ids: ['v1-quentao', 'v1-laguna', 'v1-mar', 'v1-cafe', 'v1-fogueira', 't4-l1', 't4-l2', 'sala-v1', 'sala-v2'] },
  { v: 3, c: 'receitas', ids: ['caju-v1', 'ideia-curitiba', 'ideia-registro', 'ideia-blend'] }
]
const CHAVE_V = 'atelie-aromas-versao-dados'
export function versaoAplicada() { try { return +localStorage.getItem(CHAVE_V) || 0 } catch { return 0 } }
export function marcarVersao() { try { localStorage.setItem(CHAVE_V, String(VERSAO_DADOS)) } catch { /* ignora */ } }

export async function aplicarNovidades(atual) {
  const seed = (await import('./seed.json')).default
  const novos = {}; const vistos = {}
  for (const n of NOVIDADES.filter(x => x.v > versaoAplicada())) {
    const tem = vistos[n.c] = vistos[n.c] || new Set((atual[n.c] || []).map(x => x.id))
    const ids = n.todos ? Object.keys(seed[n.c] || {}) : n.ids
    const itens = ids.filter(id => !tem.has(id) && seed[n.c]?.[id]).map(id => ({ ...seed[n.c][id], id }))
    for (const it of itens) { await gravar(n.c, it); tem.add(it.id) }
    if (itens.length) novos[n.c] = [...(novos[n.c] || []), ...itens]
  }
  marcarVersao()
  return novos
}

/* Formato da cópia de segurança, compatível com o app antigo */
export function paraCopia(estado) {
  const dados = {}
  COLECOES.forEach(c => { dados[c] = {}; (estado[c] || []).forEach(x => { dados[c][x.id] = limpar(x) }) })
  return dados
}
