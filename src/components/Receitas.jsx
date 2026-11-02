import { PROD, STATUS, LAYN, noteFor, norm, famColor, dose } from '../lib/dados.js'
import { emEstoque, camadasDe, somaCamada, checar, faltantes } from '../lib/logica.js'
import NumInput from './NumInput.jsx'

function RecCard({ r, estoque, escala, setEscala, confirmar, acoes }) {
  const P = PROD[r.produto] || PROD.vela; const w = checar(r); const falta = faltantes(r, estoque); const k = r.id
  const fator = escala[k] && r.baseNum ? escala[k] / r.baseNum : 1
  const tot = ['t', 'c', 'f'].reduce((a, l) => a + somaCamada(r, l), 0) || 1
  const cams = camadasDe(r)
  const temLinhas = cams.some(([, xs]) => xs.length)
  return (
    <article className="rc">
      <div className="top">
        <div><div className="meta">{P.n}{r.linha ? ' · ' + r.linha : ''}</div><h3>{r.nome}</h3></div>
        <select className="status" aria-label={`Status de ${r.nome}`} value={r.status} onChange={e => acoes.status(k, e.target.value)}>
          {Object.entries(STATUS).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
        </select>
      </div>
      {r.base && <div className="meta">Base: {r.base}</div>}
      {(tot > 1 || temLinhas) && <div className="bar">{cams.flatMap(([l, xs]) => xs.map((x, i) => {
        const n = noteFor(x[0]); return <span key={l + i} style={{ width: (+x[1] || 0) / tot * 100 + '%', background: n ? famColor(n.f) : 'var(--line)' }} title={x[0]} />
      }))}</div>}
      <div className="layers">
        {temLinhas ? cams.filter(([, xs]) => xs.length).map(([l, xs]) => (
          <div className="lay" key={l}><b>{LAYN[l]}</b><span>{xs.map((x, i) => {
            const miss = !r.estudo && !emEstoque(estoque, x[0], r.produto)
            const gg = Math.round((+x[1] || 0) * fator * 100) / 100
            return <span key={i} style={{ display: 'block' }}>{x[0]}{miss && <> <span className="tag-miss">comprar</span></>}<span className="dose num">{gg ? dose(gg, P.un) : 'dose a definir'}</span></span>
          })}</span></div>
        )) : <span className="muted">Fórmula a montar. Use o Círculo para propor as camadas.</span>}
      </div>
      {r.baseNum ? <label className="f">Escalar para ({P.un === 'ml' ? 'ml' : 'g'} de base)
        <NumInput min="1" value={escala[k] || r.baseNum} onValue={x => setEscala(e => ({ ...e, [k]: x }))} style={{ width: 120 }} /></label> : null}
      {w.map(x => <div className="warn" key={x}>{x}</div>)}
      {r.estudo && <div className="note">Pensada com óleos essenciais: traduzir para essências antes de testar.</div>}
      {(r.historia || r.fonte || r.notas) && <details><summary>História, fonte e notas</summary>
        {r.historia && <p>{r.historia}</p>}{r.fonte && <p className="muted">Fonte: {r.fonte}</p>}{r.notas && <p><b>Notas:</b> {r.notas}</p>}</details>}
      <details><summary>Preparo e temperaturas</summary><p>{P.prep}</p></details>
      <div className="acts">
        {(tot > 1 || temLinhas) && <button className="btn small" onClick={() => acoes.bancada(k)}>Na bancada</button>}
        <button className="btn small ghost" onClick={() => acoes.editar(r)}>Editar</button>
        <button className="btn small ghost" onClick={() => acoes.testar(r)}>Registrar teste</button>
        {falta.length > 0 && <button className="btn small ghost" onClick={() => acoes.comprar(r)}>Faltantes nas compras</button>}
        <button className="btn small ghost" onClick={() => acoes.apagar(k)}>{confirmar === k ? 'Confirmar exclusão' : 'Excluir'}</button>
      </div>
    </article>
  )
}

export default function Receitas({ receitas, estoque, carregado, filtros, setFiltros, escala, setEscala, confirmar, acoes }) {
  const c = {}; Object.keys(STATUS).forEach(s => { c[s] = receitas.filter(r => r.status === s).length })
  let list = [...receitas].sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999) || a.nome.localeCompare(b.nome))
  if (filtros.fSt !== 'todas') list = list.filter(r => r.status === filtros.fSt)
  if (filtros.fPr !== 'todos') list = list.filter(r => r.produto === filtros.fPr)
  if (filtros.busca) {
    const q = norm(filtros.busca)
    list = list.filter(r => norm(r.nome + ' ' + (r.linha || '') + ' ' + camadasDe(r).map(([, xs]) => xs.map(x => x[0]).join(' ')).join(' ')).includes(q))
  }
  const setF = (k, v) => setFiltros(f => ({ ...f, [k]: v }))
  return (
    <>
      <h2>Receitas</h2>
      <p className="lead">Testadas, a testar e a criar. Mude o status direto no cartão; o histórico de cada lote fica no Diário de testes.</p>
      <div className="stats">{Object.entries(STATUS).map(([s, l]) => <div className="stat" key={s}><b className="num">{c[s]}</b><span>{l}</span></div>)}</div>
      <div className="toolbar">
        <div className="chips">{[['todas', 'Todas'], ...Object.entries(STATUS)].map(([s, l]) => <button key={s} className="chip" aria-pressed={filtros.fSt === s} onClick={() => setF('fSt', s)}>{l}</button>)}</div>
        <button className="btn" onClick={acoes.nova}>Nova receita</button>
      </div>
      <div className="toolbar">
        <div className="chips">{[['todos', 'Todos os produtos'], ...Object.entries(PROD).map(([k, p]) => [k, p.n])].map(([s, l]) => <button key={s} className="chip" aria-pressed={filtros.fPr === s} onClick={() => setF('fPr', s)}>{l}</button>)}</div>
        <input placeholder="Buscar receita ou essência" value={filtros.busca} onChange={e => setF('busca', e.target.value)} style={{ flex: '1 1 220px', maxWidth: 320 }} />
      </div>
      {!carregado ? <div className="empty">Carregando as receitas…</div>
        : list.length ? <div className="grid">{list.map(r => <RecCard key={r.id} r={r} estoque={estoque} escala={escala} setEscala={setEscala} confirmar={confirmar} acoes={acoes} />)}</div>
          : <div className="empty">{receitas.length ? 'Nenhuma receita neste filtro.' : 'Nenhuma receita salva ainda. Use “Nova receita” ou salve uma fórmula do Círculo.'}</div>}
    </>
  )
}
