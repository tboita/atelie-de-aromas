import { useState } from 'react'
import { TIPOS } from '../lib/dados.js'
import { autoCompras } from '../lib/logica.js'

export default function Compras({ receitas, estoque, compras, carregado, confirmar, acoes }) {
  const [f, setF] = useState({ nome: '', obs: '' })
  const auto = autoCompras(receitas, estoque)
  const repor = estoque.filter(i => i.situacao === 'acabando' || i.situacao === 'acabou')
  const man = [...compras].sort((a, b) => (a.feito ? 1 : 0) - (b.feito ? 1 : 0))
  const g = {}; auto.forEach(i => { (g[i.tipo] = g[i.tipo] || []).push(i) })
  const enviar = async e => {
    e.preventDefault(); if (!f.nome.trim()) return
    if (await acoes.adicionar({ nome: f.nome.trim(), obs: f.obs.trim(), tipo: 'insumo', feito: false })) setF({ nome: '', obs: '' })
  }
  return (
    <>
      <h2>Lista de compras</h2>
      <p className="lead">Montada sozinha a partir das receitas a criar, a testar e a refazer, mais o que está acabando no estoque. Itens avulsos entram no fim.</p>
      <div className="cols2">
        <div>
          {auto.length ? Object.keys(g).map(t => (
            <section className="group" key={t}><h3>{TIPOS[t]}</h3><div className="list">
              {g[t].map(i => (
                <div className="li" key={i.nome}>
                  <div style={{ minWidth: 0 }}><div className="nm">{i.nome}</div>
                    <div className="sub">Para {i.rec.size} receita{i.rec.size > 1 ? 's' : ''}: {[...i.rec].slice(0, 5).join(', ')}{i.rec.size > 5 ? '…' : ''}</div></div>
                  <div className="ctl"><button className="btn small" onClick={() => acoes.comprei(i.nome, t)}>Comprei</button></div>
                </div>
              ))}
            </div></section>
          )) : <div className="empty">{carregado ? 'Todas as essências das receitas em andamento estão no estoque.' : 'Carregando…'}</div>}
        </div>
        <div>
          <section className="group"><h3>Repor</h3>
            {repor.length ? <div className="list">{repor.map(i => (
              <div className="li" key={i.id}><div><div className="nm">{i.nome}</div><div className="sub">{TIPOS[i.tipo] || ''} · {i.situacao === 'acabou' ? 'acabou' : 'acabando'}</div></div>
                <div className="ctl"><button className="btn small" onClick={() => acoes.reposto(i.id)}>Reposto</button></div></div>
            ))}</div> : <p className="note">Nada acabando no estoque.</p>}
          </section>
          <section className="group"><h3>Itens avulsos</h3>
            <form className="addform" onSubmit={enviar} style={{ marginBottom: 10 }}>
              <label className="f">Item<input required placeholder="Ex.: pavio de algodão" value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} /></label>
              <label className="f">Onde ou quanto<input placeholder="Ex.: Império, R$ 5,61" value={f.obs} onChange={e => setF({ ...f, obs: e.target.value })} /></label>
              <button className="btn" type="submit">Adicionar</button>
            </form>
            {man.length ? <div className="list">{man.map(i => (
              <div className="li" key={i.id}>
                <label style={{ display: 'flex', gap: 10, alignItems: 'start', minWidth: 0 }}>
                  <input type="checkbox" checked={!!i.feito} onChange={e => acoes.feito(i.id, e.target.checked)} style={{ marginTop: 4 }} />
                  <span><span className="nm" style={i.feito ? { textDecoration: 'line-through', opacity: .6 } : null}>{i.nome}</span><br /><span className="sub">{i.obs || ''}</span></span>
                </label>
                <div className="ctl">
                  {i.feito && <button className="btn small ghost" onClick={() => acoes.paraEstoque(i)}>Para o estoque</button>}
                  <button className="btn small ghost" aria-label="Remover" onClick={() => acoes.apagar(i.id)}>{confirmar === i.id ? 'Confirmar' : '×'}</button>
                </div>
              </div>
            ))}</div> : <p className="note">Nenhum item avulso.</p>}
          </section>
        </div>
      </div>
    </>
  )
}
