import { NOTES, PROD, PLANOS, noteFor, keyOf, r1 } from './dados.js'

export function emEstoque(estoque, nome, produto) {
  const k = keyOf(nome); const tipos = (PROD[produto] || PROD.vela).tipos
  return estoque.some(i => i.situacao !== 'acabou' && tipos.includes(i.tipo) && keyOf(i.nome) === k)
}
export function camadasDe(r) { const c = r.camadas || {}; return ['t', 'c', 'f'].map(l => [l, (c[l] || []).filter(x => x && x[0])]) }
export function somaCamada(r, l) { return ((r.camadas || {})[l] || []).reduce((a, x) => a + (+x[1] || 0), 0) }

export function checar(r) {
  const w = []; const t = somaCamada(r, 't'), c = somaCamada(r, 'c'), f = somaCamada(r, 'f')
  const n = ['t', 'c', 'f'].reduce((a, l) => a + ((r.camadas || {})[l] || []).length, 0)
  if (!n) { w.push('Sem fórmula ainda'); return w }
  if (n === 1) w.push('Aroma único: precisa de topo, coração e fundo')
  if (!t) w.push('Sem topo'); if (!f) w.push('Sem fundo')
  if (t && (t < c || t < f)) w.push('O topo não é a camada de maior peso')
  return w
}
export function faltantes(r, estoque) {
  if (r.estudo) return []
  const out = []
  camadasDe(r).forEach(([, xs]) => xs.forEach(x => { if (!emEstoque(estoque, x[0], r.produto)) out.push(x[0]) }))
  return out
}

export function seedLayerOf(seed, seedLayer) { return seedLayer && seed.c.includes(seedLayer) ? seedLayer : seed.c[0] }

/* Gerador do círculo: quatro planos a partir da essência-semente */
export function gerar(ui, estoque) {
  const seed = noteFor(ui.seed); if (!seed) return []
  const tem = n => emEstoque(estoque, n, ui.produto)
  const lay = seedLayerOf(seed, ui.seedLayer); const others = ['t', 'c', 'f'].filter(l => l !== lay)
  return PLANOS.map((p, pi) => {
    const used = new Set([seed.nome]); const cam = { [lay]: seed }; let falta = false
    others.forEach((l, i) => {
      let cands = []
      p.offs[i].forEach(o => {
        const fam = ((seed.f + o) % 10 + 10) % 10
        NOTES.filter(n => n.f === fam && n.c.includes(l) && !used.has(n.nome))
          .sort((a, b) => (tem(b.nome) - tem(a.nome)) || (a.forte - b.forte))
          .forEach(n => { if (!cands.includes(n)) cands.push(n) })
      })
      if (p.only) cands = cands.filter(n => tem(n.nome))
      if (!cands.length) { falta = true; return }
      const pick = cands[(ui.variant + i + pi) % Math.min(cands.length, 4)]; cam[l] = pick; used.add(pick.nome)
    })
    const forte = cam.f && cam.f.forte; const w = forte ? { t: 45, c: 40, f: 15 } : { t: 40, c: 35, f: 25 }
    const total = r1(ui.base * ui.dose / 100); const g = { t: r1(total * w.t / 100), c: r1(total * w.c / 100) }; g.f = r1(total - g.t - g.c)
    return { ...p, cam, w, g, total, falta, lay }
  })
}

/* Compras automáticas: essências das receitas em andamento que não estão no estoque */
export function autoCompras(receitas, estoque) {
  const m = new Map()
  receitas.filter(r => ['ideia', 'a-testar', 'refazer'].includes(r.status) && !r.estudo).forEach(r => {
    const P = PROD[r.produto] || PROD.vela
    camadasDe(r).forEach(([, xs]) => xs.forEach(x => {
      if (emEstoque(estoque, x[0], r.produto)) return
      const k = P.tipos[0] + '|' + keyOf(x[0])
      if (!m.has(k)) m.set(k, { nome: (noteFor(x[0]) || {}).nome || x[0], tipo: P.tipos[0], rec: new Set() })
      m.get(k).rec.add(r.nome)
    }))
  })
  return [...m.values()].sort((a, b) => b.rec.size - a.rec.size || a.nome.localeCompare(b.nome))
}
