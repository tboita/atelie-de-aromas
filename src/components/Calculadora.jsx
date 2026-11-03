import { useEffect, useMemo, useState } from 'react'
import { PROD, LAYN, fmt } from '../lib/dados.js'
import { MODELOS, planta } from '../lib/calc.js'

const r2 = n => Math.round(n * 100) / 100

/* Campo ligado: mostra c × M; ao digitar, recalcula M = valor ÷ c */
function Campo({ id, c, M, ed, setEd, setM, ...p }) {
  const valor = ed.id === id ? ed.txt : (M > 0 ? String(r2(c * M)).replace('.', ',') : '')
  return <input inputMode="decimal" value={valor} {...p}
    onFocus={e => { setEd({ id, txt: e.target.value }); e.target.select() }}
    onBlur={() => setEd({ id: null, txt: '' })}
    onChange={e => { const t = e.target.value; setEd({ id, txt: t }); const x = +t.replace(',', '.'); if (x > 0 && c > 0) setM(x / c) }} />
}

/* Número simples que aceita vírgula durante a digitação */
function Num({ value, onValue, min = 0 }) {
  const [txt, setTxt] = useState(null)
  return <input inputMode="decimal" value={txt ?? String(r2(value)).replace('.', ',')}
    onFocus={e => { setTxt(e.target.value); e.target.select() }} onBlur={() => setTxt(null)}
    onChange={e => { setTxt(e.target.value); const x = +e.target.value.replace(',', '.'); if (x > min || (min === 0 && x === 0 && e.target.value !== '')) onValue(x) }} />
}

export default function Calculadora({ receitas, onBancada }) {
  const [prod, setProd] = useState('vela')
  const [recId, setRecId] = useState('')
  const rec = receitas.find(r => r.id === recId) || null
  const pl = useMemo(() => planta(prod, rec), [prod, recId, !!rec]) // eslint-disable-line
  const [M, setM] = useState(pl.base)
  const [n, setN] = useState(1)
  const [fator, setFator] = useState(pl.fator)
  const [dose, setDose] = useState(pl.dose)
  const [ed, setEd] = useState({ id: null, txt: '' })

  /* Trocar produto ou receita recarrega as proporções e o ponto de partida */
  useEffect(() => { setM(pl.base); setFator(pl.fator); setDose(pl.dose); setEd({ id: null, txt: '' }) }, [pl])

  const recs = receitas.filter(r => r.produto === prod).sort((a, b) => a.nome.localeCompare(b.nome))
  const u = pl.un
  const d = dose / 100
  const lig = { M, ed, setEd, setM }
  const B = M * n, E = B * d

  return (
    <>
      <h2>Calculadora</h2>
      <p className="lead">Digite qualquer número, em qualquer campo, e a calculadora preenche os outros: o tamanho do recipiente, a base, cada ingrediente, a essência total ou uma camada só.</p>

      <div className="chips" role="group" aria-label="Produto" style={{ marginBottom: 12 }}>
        {Object.entries(PROD).map(([k, p]) => <button key={k} className="chip" aria-pressed={prod === k} onClick={() => { setProd(k); setRecId('') }}>{p.n}</button>)}
      </div>

      <section className="card calc">
        <div className="row">
          <label className="f" style={{ flex: '1 1 260px' }}>Receita (opcional: sem ela, vale a proporção padrão do produto)
            <select value={recId} onChange={e => setRecId(e.target.value)}>
              <option value="">Proporção padrão de {PROD[prod].n.toLowerCase()}</option>
              {recs.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          </label>
        </div>

        <div className="calc-bloco">
          <div className="gd-tt">Recipiente</div>
          <div className="calc-grid">
            <label className="f">Capacidade de cada um (ml de água)<Campo id="ml" c={1 / fator} {...lig} /></label>
            <label className="f">Quantos recipientes<input type="number" min="1" value={n} onChange={e => setN(Math.max(1, +e.target.value || 1))} /></label>
            <label className="f">{u === 'ml' ? 'ml de base' : 'g de base'} por ml de água<Num value={fator} onValue={setFator} /></label>
          </div>
          <p className="note" style={{ margin: '6px 0 0' }}>{MODELOS[prod].dica} Para medir um pote, encha de água e pese: cada grama é 1 ml.</p>
        </div>

        <div className="calc-bloco">
          <div className="gd-tt">Base {n > 1 ? `(total para ${n} recipientes)` : ''}</div>
          <div className="calc-grid">
            <label className="f calc-forte">Base total ({u})<Campo id="B" c={n} {...lig} /></label>
            {pl.ings.length > 1 && pl.ings.map((x, i) => (
              <label className="f" key={x.nome}>{x.nome} ({u})<Campo id={'i' + i} c={n * x.p} {...lig} /></label>
            ))}
          </div>
        </div>

        <div className="calc-bloco">
          <div className="gd-tt">Essência</div>
          <div className="calc-grid">
            <label className="f">Dose (% da base)<Num value={dose} onValue={setDose} /></label>
            <label className="f calc-forte">Essência total ({u})<Campo id="E" c={n * d} {...lig} /></label>
            {pl.ess.map((x, i) => {
              const g = E * x.p
              return (
                <label className="f" key={i}><span><span className={`ct ct-${x.camada}`}>{LAYN[x.camada]}</span> {x.nome === LAYN[x.camada] ? '' : x.nome}</span>
                  <Campo id={'e' + i} c={n * d * x.p} {...lig} />
                  <span className="note num">{g > 0 && g <= 2 ? `≈ ${Math.round(g * 20)} gotas · use a seringa` : g > 0 ? `${fmt(r2(g))} ml` : ''}</span>
                </label>
              )
            })}
          </div>
          {pl.lim && dose > pl.lim && <p className="warn">Acima do limite de {fmt(pl.lim)}% para {PROD[prod].n.toLowerCase()}.</p>}
        </div>

        <div className="calc-total">
          <div><span className="gd-tt">Total do lote</span><b className="num">{fmt(r2(B + E))} {u}</b></div>
          <div className="note">{n > 1 ? `${fmt(r2((B + E) / n))} ${u} em cada recipiente · ` : ''}{fmt(r2(B))} {u} de base + {fmt(r2(E))} {u} de essência</div>
          {rec && <button className="btn" onClick={() => onBancada(rec.id, pl.ref && rec.baseNum ? B * rec.baseNum / pl.ref : B)}>Abrir na bancada com estas quantidades</button>}
        </div>
      </section>
    </>
  )
}
