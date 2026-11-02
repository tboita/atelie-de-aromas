import { useState } from 'react'
import { FAM, famColor } from '../lib/dados.js'
import { CAMADA_INFO, GRUPOS, piramide, sugestoesFundo, dicaDe } from '../lib/didatica.js'

/* Seu estoque em camadas: mostra o que serve de topo, coração e fundo, e o que vale comprar */
export default function Piramide({ estoque, receitas, onComprar }) {
  const [grupo, setGrupo] = useState('vela')
  const [aberta, setAberta] = useState(null)
  const { cols, fora, total } = piramide(estoque, grupo)
  const sug = sugestoesFundo(estoque, receitas, grupo)
  const falta = ['t', 'c', 'f'].filter(l => !cols[l].length)

  return (
    <section className="pir card">
      <div className="pir-hd">
        <div><div className="eyebrow">Aprender fazendo</div><h3>Seu estoque em camadas</h3></div>
        <div className="chips" role="group" aria-label="Produto">
          {Object.entries(GRUPOS).map(([k, g]) => <button key={k} className="chip" aria-pressed={grupo === k} onClick={() => { setGrupo(k); setAberta(null) }}>{g.nome}</button>)}
        </div>
      </div>
      <p className="note" style={{ margin: '4px 0 12px' }}>Toda fórmula precisa das três camadas. Uma essência que aparece em duas colunas pode ocupar qualquer uma delas: escolha de acordo com o que mais vai na fórmula. O ·2 marca as que servem em duas camadas. Toque numa essência para ver a dica.</p>
      {total === 0 ? <p className="note">Nenhuma essência deste tipo no estoque.</p> :
        <div className="pir-cols">
          {['t', 'c', 'f'].map(l => (
            <div className={`pir-col pir-${l}`} key={l}>
              <div className="pir-tt"><b>{CAMADA_INFO[l].nome}</b><span className="num">{CAMADA_INFO[l].peso}</span></div>
              <p className="pir-tx">{CAMADA_INFO[l].texto}</p>
              {cols[l].length ? <div className="chips">
                {cols[l].map(({ item, n, varias }) => (
                  <button key={item.id + l} className="chip" aria-pressed={aberta === item.id} onClick={() => setAberta(aberta === item.id ? null : item.id)} title={FAM[n.f].n}>
                    <span className="dot" style={{ background: famColor(n.f), border: '1px solid var(--line)' }} />{n.nome}{varias && <span className="n" title="Serve em duas camadas">·{n.c.length}</span>}
                  </button>
                ))}
              </div> : <p className="warn">Nada no estoque para {CAMADA_INFO[l].nome.toLowerCase()}.</p>}
            </div>
          ))}
        </div>}
      {aberta && (() => {
        const it = estoque.find(i => i.id === aberta); const n = it && cols.t.concat(cols.c, cols.f).find(x => x.item.id === aberta)?.n
        return it ? <div className="pir-dica"><b>{n ? n.nome : it.nome}</b>{n && <span className="muted"> · {FAM[n.f].n}</span>}<br />{dicaDe(n)}</div> : null
      })()}
      {fora.length > 0 && <p className="note" style={{ marginTop: 10 }}>Fora do círculo (camada desconhecida): {fora.map(i => i.nome).join(', ')}. {dicaDe(null)}</p>}
      {falta.length > 0 && total > 0 && <p className="warn" style={{ marginTop: 8 }}>Falta {falta.map(l => CAMADA_INFO[l].nome.toLowerCase()).join(' e ')} para {GRUPOS[grupo].nome.toLowerCase()}.</p>}
      {sug.length > 0 && <div className="pir-sug">
        <div className="eyebrow" style={{ marginBottom: 6 }}>Sugestões de fundo para comprar</div>
        <div className="list">
          {sug.map(s => (
            <div className="li" key={s.n.nome}>
              <div style={{ minWidth: 0 }}><div className="nm">{s.n.nome} <span className="sub">· {FAM[s.n.f].n}{s.n.forte ? ' · forte' : ''}</span></div><div className="sub">{s.motivo}</div></div>
              <div className="ctl"><button className="btn small ghost" onClick={() => onComprar(s.n.nome, GRUPOS[grupo].produto)}>Pôr nas compras</button></div>
            </div>
          ))}
        </div>
      </div>}
    </section>
  )
}
