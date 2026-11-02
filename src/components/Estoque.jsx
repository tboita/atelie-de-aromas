import { useRef, useState } from 'react'
import { TIPOS, FAM, LAYN, noteFor, famColor } from '../lib/dados.js'
import { dicaDe, ehEssencia } from '../lib/didatica.js'
import Piramide from './Piramide.jsx'

const SIT = { tenho: 'Tenho', acabando: 'Acabando', acabou: 'Acabou' }
const VAZIO = { nome: '', tipo: 'vela', fornecedor: '', qtd: '' }

export default function Estoque({ estoque, receitas, carregado, confirmar, acoes, toast }) {
  const [f, setF] = useState(VAZIO)
  const [copia, setCopia] = useState(null)
  const arq = useRef(null)
  const g = {}; estoque.forEach(i => { (g[i.tipo] = g[i.tipo] || []).push(i) })

  const enviar = async e => {
    e.preventDefault(); if (!f.nome.trim()) return
    const ok = await acoes.adicionar({ nome: f.nome.trim(), tipo: f.tipo, fornecedor: f.fornecedor.trim(), qtd: f.qtd.trim(), situacao: 'tenho' })
    if (ok) setF(x => ({ ...VAZIO, tipo: x.tipo }))
  }
  const lerArquivo = e => {
    const file = e.target.files && e.target.files[0]; if (!file) return
    const rd = new FileReader()
    rd.onload = () => {
      try { const j = JSON.parse(rd.result); const d = j.dados || j; if (!d.receitas) throw 0; setCopia(d) }
      catch { toast('Esse arquivo não é uma cópia do Ateliê.') }
      if (arq.current) arq.current.value = ''
    }
    rd.readAsText(file)
  }
  const nNovo = f.tipo !== 'insumo' && f.nome.trim() ? noteFor(f.nome) : null
  const nRec = copia ? (Array.isArray(copia.receitas) ? copia.receitas.length : Object.keys(copia.receitas).length) : 0

  return (
    <>
      <h2>Estoque</h2>
      <p className="lead">O que você tem no ateliê. O círculo e as receitas consultam esta lista para marcar “tenho” ou “comprar”. Toque na situação para alternar entre tenho, acabando e acabou.</p>
      {carregado && <Piramide estoque={estoque} receitas={receitas} onComprar={acoes.comprarFundo} />}
      <form className="addform" onSubmit={enviar}>
        <label className="f">Item<input required placeholder="Ex.: Canela" value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} /></label>
        <label className="f">Tipo<select value={f.tipo} onChange={e => setF({ ...f, tipo: e.target.value })}>{Object.entries(TIPOS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <label className="f">Fornecedor<input placeholder="Ex.: Império das Essências" value={f.fornecedor} onChange={e => setF({ ...f, fornecedor: e.target.value })} /></label>
        <label className="f">Quantidade<input placeholder="Ex.: 10 ml" value={f.qtd} onChange={e => setF({ ...f, qtd: e.target.value })} /></label>
        <button className="btn" type="submit">Adicionar</button>
        {f.tipo !== 'insumo' && f.nome.trim().length > 2 && <p className="note" style={{ gridColumn: '1/-1', margin: 0 }}>
          {nNovo ? <><b>{nNovo.nome}</b> · {FAM[nNovo.f].n} · {nNovo.c.map(l => LAYN[l]).join(' ou ')}. </> : null}{dicaDe(nNovo)}</p>}
      </form>
      {!carregado ? <div className="empty">Carregando o estoque…</div>
        : Object.keys(TIPOS).some(t => g[t]) ? Object.keys(TIPOS).filter(t => g[t]).map(t => (
          <section className="group" key={t}><h3>{TIPOS[t]}</h3><div className="list">
            {g[t].sort((a, b) => a.nome.localeCompare(b.nome)).map(i => (
              <div className="li" key={i.id}>
                <div style={{ minWidth: 0 }}><div className="nm">{i.nome}</div><div className="sub">{[i.fornecedor, i.obs].filter(Boolean).join(' · ')}</div>
                  {ehEssencia(i) && (() => { const n = noteFor(i.nome); return <div className="camtags">{n
                    ? <><span className="dot-in" style={{ background: famColor(n.f) }} />{FAM[n.f].n}: {n.c.map(l => <span key={l} className={`ct ct-${l}`}>{LAYN[l]}</span>)}</>
                    : <span className="muted">camada desconhecida</span>}</div> })()}</div>
                <div className="ctl">
                  <input className="qtd" key={i.id + '|' + (i.qtd || '')} defaultValue={i.qtd || ''} placeholder="quantidade" aria-label={`Quantidade de ${i.nome}`}
                    onBlur={e => { const v = e.target.value.trim(); if (v !== (i.qtd || '')) acoes.qtd(i.id, v) }}
                    onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }} />
                  <button className={`pill sit sit-${i.situacao || 'tenho'}`} onClick={() => acoes.sit(i)}>{SIT[i.situacao || 'tenho']}</button>
                  <button className="btn small ghost" aria-label={`Remover ${i.nome}`} onClick={() => acoes.apagar(i.id)}>{confirmar === i.id ? 'Confirmar' : '×'}</button>
                </div>
              </div>
            ))}
          </div></section>
        )) : <div className="empty">Estoque vazio. Adicione o primeiro item acima.</div>}
      <section className="group card" style={{ marginTop: 12 }}><h3>Cópia de segurança</h3>
        <p className="note" style={{ margin: '4px 0 10px' }}>Os dados ficam na nuvem e aparecem em qualquer aparelho. A cópia serve como garantia extra e para trazer os dados do app antigo, que guardava tudo só no celular.</p>
        <div className="row">
          <button className="btn" onClick={acoes.salvarCopia}>Salvar cópia</button>
          <label className="btn ghost" htmlFor="in-copia" style={{ display: 'inline-flex', alignItems: 'center' }}>Restaurar cópia</label>
          <input type="file" id="in-copia" ref={arq} accept="application/json,.json" hidden onChange={lerArquivo} />
        </div>
        {copia && <p className="note" style={{ marginTop: 8 }}>Cópia com {nRec} receitas. Ela substitui tudo o que está na nuvem agora.{' '}
          <button className="btn small" onClick={async () => { const d = copia; setCopia(null); await acoes.restaurar(d) }}>Restaurar</button>{' '}
          <button className="btn small ghost" onClick={() => setCopia(null)}>Cancelar</button></p>}
      </section>
    </>
  )
}
