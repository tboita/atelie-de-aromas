import { useEffect, useState } from 'react'
import { hoje } from '../lib/dados.js'

const novo = pre => ({ data: pre?.data || hoje(), receita: pre?.receita || '', pote: '', base: pre?.base || '', essencia: '', frio: '', quente: '', mudar: '' })
const Dots = ({ n }) => <span className="dots" aria-label={`${n || 0} de 5`}>{[1, 2, 3, 4, 5].map(i => <i key={i} className={i <= (+n || 0) ? 'on' : ''} />)}</span>

export default function Diario({ receitas, diario, carregado, pre, limparPre, confirmar, acoes }) {
  const [f, setF] = useState(() => novo(pre))
  useEffect(() => { if (pre) setF(novo(pre)) }, [pre])
  const list = [...diario].sort((a, b) => (b.data || '').localeCompare(a.data || ''))
  const campo = (k, extra = {}) => ({ value: f[k], onChange: e => setF({ ...f, [k]: e.target.value }), ...extra })
  const enviar = async e => {
    e.preventDefault(); if (!f.receita.trim()) return
    const d = { data: f.data, receita: f.receita.trim(), pote: f.pote.trim(), base: f.base.trim(), essencia: f.essencia.trim(), frio: +f.frio || null, quente: +f.quente || null, mudar: f.mudar.trim() }
    if (await acoes.adicionar(d)) { limparPre(); setF(novo(null)) }
  }
  return (
    <>
      <h2>Diário de testes</h2>
      <p className="lead">Um registro por lote. Aroma frio é a vela apagada; aroma quente, acesa. Nota de 1 a 5.</p>
      <form className="addform" onSubmit={enviar}>
        <label className="f">Data<input type="date" {...campo('data')} /></label>
        <label className="f">Receita<input list="rec-list" required {...campo('receita')} /></label>
        <label className="f">Pote ou forma<input placeholder="Ex.: lata 150 ml" {...campo('pote')} /></label>
        <label className="f">Base<input placeholder="Ex.: 110 g de coco" {...campo('base')} /></label>
        <label className="f">Essência<input placeholder="Ex.: 10 g (9%)" {...campo('essencia')} /></label>
        <label className="f">Aroma frio (1 a 5)<input type="number" min="1" max="5" {...campo('frio')} /></label>
        <label className="f">Aroma quente (1 a 5)<input type="number" min="1" max="5" {...campo('quente')} /></label>
        <label className="f" style={{ gridColumn: '1/-1' }}>O que mudar<input {...campo('mudar')} /></label>
        <button className="btn" type="submit">Registrar</button>
      </form>
      <datalist id="rec-list">{receitas.map(r => <option key={r.id} value={r.nome} />)}</datalist>
      {list.length ? <div className="list">{list.map(d => (
        <div className="li" key={d.id}>
          <div style={{ minWidth: 0 }}>
            <div className="nm">{d.receita} <span className="sub num">{d.data || 'sem data'}</span></div>
            <div className="sub">{[d.pote, d.base, d.essencia].filter(Boolean).join(' · ')}</div>
            <div className="sub">Frio <Dots n={d.frio} /> · Quente <Dots n={d.quente} /></div>
            {d.mudar && <div>{d.mudar}</div>}
          </div>
          <div className="ctl"><button className="btn small ghost" onClick={() => acoes.apagar(d.id)}>{confirmar === d.id ? 'Confirmar' : '×'}</button></div>
        </div>
      ))}</div> : <div className="empty">{carregado ? 'Nenhum lote registrado.' : 'Carregando…'}</div>}
    </>
  )
}
