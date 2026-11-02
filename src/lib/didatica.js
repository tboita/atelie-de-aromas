/* Parte didática: o que é cada camada, onde cada essência entra e o que falta no estoque */
import { NOTES, FAM, LAYN, noteFor, keyOf } from './dados.js'
import { camadasDe } from './logica.js'

export const CAMADA_INFO = {
  t: { nome: 'Topo', peso: '40%', curto: 'o primeiro cheiro',
    texto: 'É o que se sente ao abrir a vela e nos primeiros minutos acesa. Evapora rápido, por isso leva a maior parte da essência.' },
  c: { nome: 'Coração', peso: '35%', curto: 'a personalidade',
    texto: 'Aparece quando o topo começa a sumir e dá o caráter da vela. É a ponte entre o fresco do topo e o pesado do fundo.' },
  f: { nome: 'Fundo', peso: '25%', curto: 'o que segura tudo',
    texto: 'Evapora devagar e prende as outras notas. Sem fundo, o cheiro fica fraco e some rápido. Fundos fortes (patchouli, vetiver) entram com só 15%.' }
}

/* Grupos de estoque: cada produto usa um tipo de essência */
export const GRUPOS = {
  vela: { nome: 'Velas', tipos: ['vela'], produto: 'vela' },
  pele: { nome: 'Sabonete e manteiga', tipos: ['cosmetica', 'oleo'], produto: 'sabonete' },
  hidro: { nome: 'Sabonete líquido', tipos: ['hidro'], produto: 'liquido' }
}

export const ehEssencia = i => i.tipo !== 'insumo'

/* Explica onde a essência entra, em uma frase */
export function dicaDe(n) {
  if (!n) return 'Fora do círculo de aromas: o app não sabe a camada. Teste na tira de papel: se some em minutos, é topo; se dura horas, é fundo.'
  const c = n.c.join('')
  let s = ''
  if (c === 't') s = 'Só topo: abre a vela e evapora rápido. Precisa de coração e fundo junto.'
  else if (c === 'c') s = 'Coração: dá o corpo da vela. Combine com um topo mais leve e um fundo.'
  else if (c === 'f') s = 'Fundo: fixa as outras notas e faz o cheiro durar.'
  else if (c === 'tc') s = 'Topo ou coração. Se já houver um cítrico, marinho ou fruta no topo, use como coração; se não, pode abrir a vela.'
  else if (c === 'cf') s = 'Coração ou fundo. Se a fórmula não tiver outro fundo, use como fundo.'
  else s = n.c.map(l => LAYN[l]).join(' ou ')
  if (n.forte) s += ' É forte: perto de 15% do total.'
  return s
}

/* Versão curta para listas */
export function dicaCurta(n) {
  if (!n) return 'camada desconhecida'
  const m = { t: 'abre a vela e some rápido', c: 'dá o corpo', f: 'segura o cheiro', tc: 'pode abrir a vela ou dar o corpo', cf: 'pode dar o corpo ou segurar o cheiro', tcf: 'serve em qualquer camada' }
  return (m[n.c.join('')] || '') + (n.forte ? '; forte, use pouco' : '')
}

/* Distribui o estoque de um grupo pelas três camadas */
export function piramide(estoque, grupo) {
  const tipos = GRUPOS[grupo].tipos
  const itens = estoque.filter(i => tipos.includes(i.tipo) && i.situacao !== 'acabou')
  const cols = { t: [], c: [], f: [] }; const fora = []
  itens.forEach(i => {
    const n = noteFor(i.nome)
    if (!n) { fora.push(i); return }
    n.c.forEach(l => cols[l].push({ item: i, n, varias: n.c.length > 1 }))
  })
  Object.values(cols).forEach(xs => xs.sort((a, b) => a.n.nome.localeCompare(b.n.nome)))
  return { cols, fora, total: itens.length }
}

/* Fundos que valem a compra: os usados por receitas em andamento primeiro, depois famílias que faltam no fundo */
export function sugestoesFundo(estoque, receitas, grupo) {
  const tipos = GRUPOS[grupo].tipos
  const tenho = new Set(estoque.filter(i => tipos.includes(i.tipo) && i.situacao !== 'acabou').map(i => keyOf(i.nome)))
  const famsFundo = new Set(NOTES.filter(n => tenho.has(n.nome) && n.c.includes('f')).map(n => n.f))
  const prods = grupo === 'vela' ? ['vela'] : grupo === 'pele' ? ['sabonete', 'manteiga', 'cabelo'] : ['liquido']
  const uso = {}
  receitas.filter(r => prods.includes(r.produto) && !r.estudo && r.status !== 'aprovada').forEach(r => {
    camadasDe(r).forEach(([, xs]) => xs.forEach(x => { const k = keyOf(x[0]); (uso[k] = uso[k] || new Set()).add(r.nome) }))
  })
  return NOTES.filter(n => n.c.includes('f') && !tenho.has(n.nome)).map(n => {
    const rec = [...(uso[n.nome] || [])]
    const famNova = !famsFundo.has(n.f)
    const motivo = rec.length
      ? `Está em ${rec.length} receita${rec.length > 1 ? 's' : ''}: ${rec.slice(0, 3).join(', ')}${rec.length > 3 ? '…' : ''}.`
      : famNova ? `Você ainda não tem fundo da família ${FAM[n.f].n.toLowerCase()}. ${FAM[n.f].d}` : `Outra opção de fundo ${FAM[n.f].n.toLowerCase()}.`
    return { n, rec: rec.length, famNova, motivo, pontos: rec.length * 10 + (famNova ? 5 : 0) - (n.forte ? 1 : 0) }
  }).sort((a, b) => b.pontos - a.pontos || a.n.nome.localeCompare(b.n.nome)).slice(0, 6)
}

/* Lê uma mistura (lista de [essência, gramas]) e diz em que camada cada uma tende a cair */
export function analisarMistura(ess) {
  const lidas = ess.filter(x => x && x[0]).map(([nome, g]) => ({ nome, g: +g || 0, n: noteFor(nome) }))
  const tem = l => lidas.some(x => x.n && x.n.c.includes(l))
  const avisos = []
  if (lidas.length === 1) avisos.push('Uma essência só: o cheiro fica único, sem a evolução topo, coração e fundo.')
  if (!tem('f')) avisos.push('Sem fundo: é a causa mais comum de cheiro fraco e que some rápido.')
  if (!tem('c') && lidas.length > 1) avisos.push('Sem coração: falta a ponte entre o topo e o fundo.')
  return { lidas, avisos }
}
