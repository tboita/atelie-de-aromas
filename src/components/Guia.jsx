import { useState } from 'react'
import { STATUS } from '../lib/dados.js'
import { FORMULA, GUIAS } from '../lib/guia.js'
import { CAMADA_INFO } from '../lib/didatica.js'

/* Passo a passo: como montar a fórmula e como fazer cada produto */
export default function Guia({ receitas, onBancada }) {
  const [prod, setProd] = useState('vela')
  const g = GUIAS[prod]
  const recs = receitas.filter(r => r.produto === prod && ['a-testar', 'refazer', 'aprovada'].includes(r.status)).sort((a, b) => a.nome.localeCompare(b.nome))
  return (
    <>
      <h2>Passo a passo</h2>
      <p className="lead">Para aprender fazendo: primeiro a lógica da fórmula, depois o modo de fazer de cada produto, com a temperatura e a razão de cada etapa.</p>

      <section className="card gd-sec">
        <div className="eyebrow">Antes de qualquer produto</div>
        <h3>{FORMULA.titulo}</h3>
        <div className="gd-camadas">
          {['t', 'c', 'f'].map(l => <div key={l} className={`gd-cam pir-${l}`}><b>{CAMADA_INFO[l].nome} <span className="num">{CAMADA_INFO[l].peso}</span></b><span>{CAMADA_INFO[l].curto}</span></div>)}
        </div>
        <ol className="gd-passos">
          {FORMULA.passos.map(([t, d], i) => <li key={i}><span className="gd-n num">{i + 1}</span><div><b>{t}</b><p>{d}</p></div></li>)}
        </ol>
      </section>

      <div className="chips" role="group" aria-label="Produto" style={{ margin: '24px 0 14px' }}>
        {Object.entries(GUIAS).map(([k, x]) => <button key={k} className="chip" aria-pressed={prod === k} onClick={() => setProd(k)}>{x.nome}</button>)}
      </div>

      <section className="card gd-sec">
        <div className="eyebrow">Modo de fazer</div>
        <h3>{g.nome}</h3>
        <p className="muted" style={{ margin: '4px 0 14px' }}>{g.resumo}</p>
        <div className="gd-grid">
          <div>
            <div className="gd-tt">Separe antes</div>
            <ul className="gd-lista">{g.materiais.map(m => <li key={m}>{m}</li>)}</ul>
          </div>
          <div>
            <div className="gd-tt">Etapas</div>
            <ol className="gd-passos">
              {g.passos.map(([t, temp, porque], i) => (
                <li key={i}><span className="gd-n num">{i + 1}</span>
                  <div><b>{t}</b>{temp && <span className="gd-temp">{temp}</span>}<p>{porque}</p></div></li>
              ))}
            </ol>
          </div>
        </div>
        <div className="gd-grid gd-baixo">
          <div><div className="gd-tt">Como avaliar</div><ul className="gd-lista">{g.avaliar.map(x => <li key={x}>{x}</li>)}</ul></div>
          <div><div className="gd-tt">O que já aconteceu no ateliê</div><ul className="gd-lista gd-erros">{g.erros.map(x => <li key={x}>{x}</li>)}</ul></div>
        </div>
        <div className="gd-seg">{g.seguranca.map(x => <span key={x}>{x}</span>)}</div>
      </section>

      <section className="gd-sec" style={{ marginTop: 20 }}>
        <div className="eyebrow">Praticar agora</div>
        <p className="note" style={{ margin: '4px 0 8px' }}>Abra uma receita na Bancada: ela mostra as doses pesadas e estas mesmas etapas para marcar enquanto faz.</p>
        {recs.length
          ? <div className="chips">{recs.map(r => <button key={r.id} className="chip" onClick={() => onBancada(r.id)}>{r.nome} <span className="n">{STATUS[r.status]}</span></button>)}</div>
          : <p className="note">Nenhuma receita deste produto pronta para testar.</p>}
      </section>
    </>
  )
}
