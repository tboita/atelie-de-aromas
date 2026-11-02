import { useEffect, useState } from 'react'
import { FAM, NOTES, PROD, LAYN, noteFor, norm, keyOf, famColor, dose, fmt, r1 } from '../lib/dados.js'
import { emEstoque, camadasDe, gerar, seedLayerOf } from '../lib/logica.js'
import NumInput from './NumInput.jsx'

function Roda({ ui, props, onFam }) {
  const cx = 210, cy = 210, R1 = 92, R2 = 196, Rl = 146, a0 = -90 - 18
  const P = (r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)]
  const seed = noteFor(ui.seed); const cur = props[ui.prop] || props[0]; const fams = {}
  if (cur) Object.entries(cur.cam).forEach(([l, n]) => { fams[n.f] = (fams[n.f] || '') + l.toUpperCase() })
  const words = seed ? seed.nome.split(' ') : []
  const lines = words.length > 2 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [seed?.nome]
  return (
    <svg viewBox="0 0 420 420" role="img" aria-label="Círculo de aromas com dez famílias">
      {FAM.map((F, i) => {
        const s0 = a0 + i * 36, s1 = s0 + 36
        const [x1, y1] = P(R2, s0), [x2, y2] = P(R2, s1), [x3, y3] = P(R1, s1), [x4, y4] = P(R1, s0)
        const on = fams[i] !== undefined; const [lx, ly] = P(Rl, s0 + 18); const [bx, by] = P(R2 - 18, s0 + 18)
        return (
          <g key={i}>
            <path className="seg" onClick={() => onFam(i)} d={`M${x1},${y1}A${R2},${R2} 0 0 1 ${x2},${y2}L${x3},${y3}A${R1},${R1} 0 0 0 ${x4},${y4}Z`}
              fill={famColor(i)} {...(on ? { stroke: 'var(--accent)', strokeWidth: 4 } : {})} {...(ui.fam === i ? { opacity: .92 } : {})}>
              <title>{F.n}: {F.d}</title>
            </path>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize="12.5" fontWeight={ui.fam === i ? 600 : 500} fill="var(--seg-ink)">{F.n}</text>
            {on && <text x={bx} y={by} textAnchor="middle" dominantBaseline="middle" fontFamily="Jost,sans-serif" fontSize="11" fontWeight="600" letterSpacing="1.5" fill="var(--seg-ink)">{fams[i].split('').join('·')}</text>}
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={R1 - 6} fill="var(--card)" stroke="var(--line)" />
      {seed && <>
        <text x={cx} y={cy - 14} textAnchor="middle" fontFamily="Jost,sans-serif" fontSize="10" letterSpacing="2" fill="var(--muted)">{LAYN[seedLayerOf(seed, ui.seedLayer)].toUpperCase()}</text>
        {lines.map((t, i) => <text key={i} x={cx} y={cy + 8 + i * 20} textAnchor="middle" fontFamily="Cormorant Garamond,Georgia,serif" fontSize={lines.length > 1 ? 19 : 21} fontWeight="600" fill="var(--fg)">{t}</text>)}
      </>}
    </svg>
  )
}

function PropCard({ p, i, ui, P, estoque, onSel, onSalvar, onComprar }) {
  const tem = n => emEstoque(estoque, n, ui.produto)
  const falt = ['t', 'c', 'f'].filter(l => p.cam[l] && !tem(p.cam[l].nome)).length
  return (
    <article className="prop" aria-pressed={ui.prop === i} tabIndex={0}
      onClick={e => { if (!e.target.closest('button')) onSel(i) }}
      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); onSel(i) } }}>
      <div><h3>{p.nome}</h3><p>{p.desc}</p></div>
      <div className="bar">{['t', 'c', 'f'].map(l => p.cam[l] && <span key={l} style={{ width: p.w[l] + '%', background: famColor(p.cam[l].f) }} title={LAYN[l]} />)}</div>
      <div className="layers">
        {['t', 'c', 'f'].map(l => {
          const n = p.cam[l]
          if (!n) return <div className="lay" key={l}><b>{LAYN[l]}</b><span className="warn">Sem essência {p.only ? 'no estoque ' : ''}para esta camada</span></div>
          return (
            <div className="lay" key={l}><b>{LAYN[l]}</b>
              <span>{n.nome} {tem(n.nome) ? <span className="tag-ok">tenho</span> : <span className="tag-miss">comprar</span>}
                <span className="dose num">{dose(p.g[l], P.un)} · {p.w[l]}%</span></span>
            </div>
          )
        })}
      </div>
      <div className="row" style={{ gap: 6 }}>
        <button className="btn small" disabled={p.falta} onClick={() => onSalvar(p)}>Salvar como receita a criar</button>
        {falt > 0 && <button className="btn small ghost" onClick={() => onComprar(p)}>Faltantes na lista de compras</button>}
      </div>
    </article>
  )
}

export default function Circulo({ ui, setUi, estoque, receitas, toast, onSalvarProp, onComprarProp, onAbrirReceita }) {
  const seed = noteFor(ui.seed) || NOTES[0]
  const props = gerar(ui, estoque)
  const P = PROD[ui.produto]
  const famNotes = NOTES.filter(n => n.f === ui.fam)
  const usam = receitas.filter(r => camadasDe(r).some(([, xs]) => xs.some(x => keyOf(x[0]) === seed.nome)))
  const [txt, setTxt] = useState(ui.seed)
  useEffect(() => { setTxt(ui.seed) }, [ui.seed])

  const setSeed = nome => { const n = noteFor(nome); if (!n) return false; setUi(u => ({ ...u, seed: n.nome, seedLayer: null, fam: n.f, variant: 0, prop: 0 })); return true }
  const total = r1(ui.base * ui.dose / 100)

  return (
    <div className="circ">
      <section className="wheel">
        <Roda ui={ui} props={props} onFam={f => setUi(u => ({ ...u, fam: f }))} />
        <div className="famnotes">
          <div className="eyebrow">{FAM[ui.fam].n}</div>
          <p className="note" style={{ margin: '2px 0 8px' }}>{FAM[ui.fam].d} Toque numa fatia do círculo para ver outra família.</p>
          <div className="chips">
            {famNotes.map(n => (
              <button key={n.nome} className="chip" aria-pressed={n.nome === seed.nome} onClick={() => setSeed(n.nome)}>
                {emEstoque(estoque, n.nome, ui.produto) && <span className="dot" title="Em estoque" />}{n.nome}
              </button>
            ))}
          </div>
          <p className="note" style={{ marginTop: 8 }}><span className="dot" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)' }} /> em estoque para {P.n.toLowerCase()}</p>
        </div>
      </section>
      <section className="panel">
        <div>
          <h2>Comece por uma essência</h2>
          <p className="lead" style={{ marginBottom: 10 }}>Escolha a essência e o produto. O círculo projeta quatro fórmulas em pirâmide, com as doses já calculadas.</p>
          <div className="row">
            <label className="f" style={{ flex: '1 1 200px' }}>Essência
              <input list="notas-list" value={txt} autoComplete="off"
                onChange={e => {
                  const v = e.target.value; setTxt(v); const n = noteFor(v)
                  if (n && (norm(v) === norm(n.nome) || n.al.some(a => norm(a) === norm(v)))) setSeed(n.nome)
                }}
                onBlur={() => { if (txt === ui.seed) return; if (!setSeed(txt)) { toast('Essência fora do círculo. Escolha uma da lista.'); setTxt(ui.seed) } }} />
            </label>
            <label className="f">Camada da essência
              <select value={seedLayerOf(seed, ui.seedLayer)} onChange={e => setUi(u => ({ ...u, seedLayer: e.target.value }))}>
                {seed.c.map(l => <option key={l} value={l}>{LAYN[l]}</option>)}
              </select>
            </label>
          </div>
        </div>
        <div className="row">
          <div className="chips" role="group" aria-label="Produto">
            {Object.entries(PROD).filter(([k]) => k !== 'cabelo').map(([k, p]) => (
              <button key={k} className="chip" aria-pressed={ui.produto === k} onClick={() => setUi(u => ({ ...u, produto: k, base: p.base, dose: p.dose }))}>{p.n}</button>
            ))}
          </div>
        </div>
        <div className="row">
          <label className="f">{P.lb}<NumInput min="1" step="1" value={ui.base} onValue={x => setUi(u => ({ ...u, base: x }))} style={{ width: 120 }} /></label>
          <label className="f">Dose de essência (%)<NumInput min="0.1" step="0.1" value={ui.dose} onValue={x => setUi(u => ({ ...u, dose: x }))} style={{ width: 110 }} /></label>
          <div className="note num" style={{ paddingBottom: 8 }}>Total: <b>{dose(total, P.un)}</b>{P.lim && ui.dose > P.lim ? <> <span className="warn">acima do limite ({fmt(P.lim)}%)</span></> : null}</div>
        </div>
        <div className="props">
          {props.map((p, i) => <PropCard key={p.nome} p={p} i={i} ui={ui} P={P} estoque={estoque}
            onSel={i => setUi(u => ({ ...u, prop: i }))} onSalvar={onSalvarProp} onComprar={onComprarProp} />)}
        </div>
        <div className="row"><button className="btn ghost" onClick={() => setUi(u => ({ ...u, variant: u.variant + 1 }))}>Outras combinações</button></div>
        <details className="rules"><summary>Regras do ateliê usadas no cálculo</summary><ul>
          <li>Topo 40%, coração 35%, fundo 25%. Com patchouli ou vetiver no fundo: 45%, 40% e 15%.</li>
          <li>Vela: até 100 ml de essência por kg de cera (10 g para 110 g). Sabonete em barra: 3%. Manteiga: 1% (10 gotas por pote de 50 g). Sabonete líquido: 0,5%.</li>
          <li>1 g ≈ 1 ml ≈ 20 gotas. Abaixo de 2 g, medir com seringa de 1 ou 3 ml sem agulha.</li>
          <li>Essência para vela não vai na pele: sabonete e manteiga usam essência cosmética.</li>
          <li>As fórmulas do círculo são pontos de partida pela família olfativa; o teste decide.</li>
        </ul></details>
        <div>
          <div className="eyebrow">Receitas que já usam {seed.nome.toLowerCase()}</div>
          {usam.length
            ? <div className="chips" style={{ marginTop: 6 }}>{usam.slice(0, 14).map(r => <button key={r.id} className="chip" onClick={() => onAbrirReceita(r.nome)}>{r.nome}</button>)}</div>
            : <p className="note">Nenhuma ainda.</p>}
        </div>
      </section>
    </div>
  )
}
