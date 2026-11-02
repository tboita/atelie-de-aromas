import { useEffect, useState } from 'react'
import { PROD, PASSOS, LAYN, fmt, dose } from '../lib/dados.js'
import { camadasDe } from '../lib/logica.js'
import NumInput from './NumInput.jsx'

function Tick({ on, onToggle, children }) {
  return <div className="tick" role="checkbox" tabIndex={0} aria-checked={on} onClick={onToggle}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}>
    <span className="bx">{on ? '✓' : ''}</span>{children}</div>
}

export default function Bancada({ r, baseInicial, onFechar, onDiario }) {
  const [base, setBase] = useState(baseInicial || r.baseNum || null)
  const [feitos, setFeitos] = useState({})

  /* Tela acesa enquanto a bancada estiver aberta */
  useEffect(() => {
    let wake = null; let vivo = true
    const pedir = async () => { try { if (navigator.wakeLock && vivo) wake = await navigator.wakeLock.request('screen') } catch { wake = null } }
    const vis = () => { if (document.visibilityState === 'visible') pedir() }
    pedir(); document.addEventListener('visibilitychange', vis)
    document.body.style.overflow = 'hidden'
    const esc = e => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', esc)
    return () => { vivo = false; document.removeEventListener('visibilitychange', vis); document.removeEventListener('keydown', esc); document.body.style.overflow = ''; if (wake) wake.release().catch(() => {}) }
  }, [onFechar])

  const P = PROD[r.produto] || PROD.vela; const fator = base && r.baseNum ? base / r.baseNum : 1
  const chave = r.produto === 'cabelo' ? (/condicionador/i.test(r.nome) ? 'condicionador' : 'shampoo') : r.produto
  const passos = PASSOS[chave] || []
  const ess = camadasDe(r).flatMap(([l, xs]) => xs.map((x, i) => ({ l, n: x[0], g: Math.round((+x[1] || 0) * fator * 100) / 100, k: 'e' + l + i })))
  const tot = ess.reduce((a, x) => a + x.g, 0)
  const tg = k => setFeitos(f => ({ ...f, [k]: !f[k] }))

  return (
    <div className="bq" role="dialog" aria-label={`Na bancada: ${r.nome}`}><div className="in">
      <div className="hd"><div><div className="eyebrow">{P.n} · na bancada</div><h2>{r.nome}</h2></div>
        <button className="btn ghost" onClick={onFechar}>Fechar</button></div>
      {r.base && <div className="muted">Base da ficha: {r.base}</div>}
      {r.baseNum ? <>
        <label className="f">Vou fazer com ({P.un === 'ml' ? 'ml' : 'g'} de base)
          <NumInput min="1" value={base || r.baseNum} onValue={setBase} style={{ fontSize: 20, maxWidth: 160 }} /></label>
        {fator !== 1 && <div className="note">Doses multiplicadas por {fmt(fator)} em relação à ficha.</div>}
      </> : null}
      <div><div className="sec">Essências · pese e marque</div>
        {ess.map(x => (
          <Tick key={x.k} on={!!feitos[x.k]} onToggle={() => tg(x.k)}>
            <span className="tx"><span className="lay">{LAYN[x.l]}</span>{x.n}
              {x.g ? <small className="num">{fmt(x.g)} ml{x.g <= 1.5 ? ` · ${Math.round(x.g * 20)} gotas` : ''}{x.g < 2 ? ' · use a seringa' : ''}</small> : null}</span>
            <span className="g">{x.g ? fmt(x.g) + ' g' : 'a definir'}</span>
          </Tick>
        ))}
        {tot ? <p className="note num" style={{ marginTop: 8 }}>Total de essência: {dose(Math.round(tot * 100) / 100, P.un)}</p> : null}
      </div>
      {passos.length > 0 && <div><div className="sec">Preparo</div>
        {passos.map((p, i) => <Tick key={i} on={!!feitos['p' + i]} onToggle={() => tg('p' + i)}><span className="tx">{p[0]}</span><span className="temp">{p[1]}</span></Tick>)}</div>}
      {r.notas && <div><div className="sec">Notas da ficha</div><p>{r.notas}</p></div>}
      <div className="row"><button className="btn big" onClick={() => onDiario(base)}>Registrar este lote no diário</button></div>
      <p className="note">A tela fica acesa enquanto esta página estiver aberta, quando o celular permite.</p>
    </div></div>
  )
}
