import { useState } from 'react'
import { LAYN, FAM, famColor, hoje } from '../lib/dados.js'
import { analisarMistura, dicaCurta } from '../lib/didatica.js'

export const SIT_VELA = { curando: 'Curando', pronta: 'Pronta', reservada: 'Reservada', vendida: 'Vendida', teste: 'Teste' }
const VAZIO = { nome: '', receita: '', base: '110 g de cera de coco', recipiente: '', unidades: '1', data: '', situacao: 'curando', essencias: '', notas: '' }

/* "Canela 6, Madeira 2,5" vira [['Canela',6],['Madeira',2.5]] */
const lerEss = s => s.split(/[;\n]|,(?!\d)/).map(x => x.trim()).filter(Boolean).map(x => { const m = x.match(/^(.*?)\s+([\d.,]+)\s*g?$/); return m ? [m[1].trim(), +m[2].replace(',', '.')] : [x, 0] })

function Leitura({ ess }) {
  const { lidas, avisos } = analisarMistura(ess)
  if (!lidas.length) return <p className="note">Essências não registradas.</p>
  return (
    <div className="leit">
      {lidas.map((x, i) => (
        <div className="lay" key={i}><b>{x.n ? x.n.c.map(l => LAYN[l]).join(' / ') : '?'}</b>
          <span><span className="dot-in" style={{ background: x.n ? famColor(x.n.f) : 'var(--line)' }} />{x.nome}{x.g ? <span className="muted num"> · {String(x.g).replace('.', ',')} g</span> : null}
            <span className="dose">{x.n ? FAM[x.n.f].n + ': ' : ''}{dicaCurta(x.n)}</span></span></div>
      ))}
      {avisos.map(a => <div className="warn" key={a}>{a}</div>)}
    </div>
  )
}

export default function Velas({ velas, receitas, carregado, confirmar, acoes }) {
  const [f, setF] = useState(VAZIO)
  const [aberto, setAberto] = useState(false)
  const [filtro, setFiltro] = useState('todas')
  const c = {}; Object.keys(SIT_VELA).forEach(s => { c[s] = velas.filter(v => v.situacao === s).reduce((a, v) => a + (+v.unidades || 0), 0) })
  let list = [...velas].sort((a, b) => (b.data || '').localeCompare(a.data || '') || a.nome.localeCompare(b.nome))
  if (filtro !== 'todas') list = list.filter(v => v.situacao === filtro)
  const campo = k => ({ value: f[k], onChange: e => setF({ ...f, [k]: e.target.value }) })
  const enviar = async e => {
    e.preventDefault(); if (!f.nome.trim()) return
    const d = { nome: f.nome.trim(), receita: f.receita.trim(), base: f.base.trim(), recipiente: f.recipiente.trim(), unidades: +f.unidades || null,
      data: f.data, situacao: f.situacao, essencias: lerEss(f.essencias), notas: f.notas.trim() }
    if (await acoes.adicionar(d)) { setF(VAZIO); setAberto(false) }
  }
  const daReceita = nome => {
    const r = receitas.find(x => x.nome === nome); if (!r) return
    const ess = ['t', 'c', 'f'].flatMap(l => (r.camadas?.[l] || []).filter(x => x[0]).map(x => `${x[0]} ${String(x[1] || '').replace('.', ',')}`.trim()))
    setF(x => ({ ...x, receita: nome, nome: x.nome || nome, base: r.base || x.base, essencias: ess.join(', ') }))
  }

  return (
    <>
      <h2>Velas produzidas</h2>
      <p className="lead">Cada lote que sai da bancada: quantas unidades, em que pote, com que essências e em que situação. A leitura de cada vela mostra em que camada cada essência caiu, para entender por que ela ficou forte ou fraca.</p>
      <div className="stats">{Object.entries(SIT_VELA).map(([s, l]) => <div className="stat" key={s}><b className="num">{c[s]}</b><span>{l}</span></div>)}</div>
      <div className="toolbar">
        <div className="chips">{[['todas', 'Todas'], ...Object.entries(SIT_VELA)].map(([s, l]) => <button key={s} className="chip" aria-pressed={filtro === s} onClick={() => setFiltro(s)}>{l}</button>)}</div>
        <button className="btn" onClick={() => setAberto(a => !a)}>{aberto ? 'Fechar' : 'Registrar lote'}</button>
      </div>
      {aberto && <form className="addform" onSubmit={enviar}>
        <label className="f">Da receita<input list="rec-velas" value={f.receita} onChange={e => { setF({ ...f, receita: e.target.value }); daReceita(e.target.value) }} placeholder="Opcional" /></label>
        <label className="f">Nome do lote<input required placeholder="Ex.: Fogueira, v2" {...campo('nome')} /></label>
        <label className="f">Base<input {...campo('base')} /></label>
        <label className="f">Recipiente<input placeholder="Ex.: lata 150 ml" {...campo('recipiente')} /></label>
        <label className="f">Unidades<input type="number" min="0" {...campo('unidades')} /></label>
        <label className="f">Data<input type="date" {...campo('data')} /></label>
        <label className="f">Situação<select {...campo('situacao')}>{Object.entries(SIT_VELA).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <label className="f" style={{ gridColumn: '1/-1' }}>Essências e gramas<input placeholder="Ex.: Canela 6, Madeira 2,5, Baunilha 1,5" {...campo('essencias')} /></label>
        <label className="f" style={{ gridColumn: '1/-1' }}>Notas<input {...campo('notas')} /></label>
        <button className="btn" type="submit">Salvar lote</button>
      </form>}
      <datalist id="rec-velas">{receitas.filter(r => r.produto === 'vela').map(r => <option key={r.id} value={r.nome} />)}</datalist>
      {!carregado ? <div className="empty">Carregando…</div>
        : list.length ? <div className="grid">{list.map(v => (
          <article className="rc" key={v.id}>
            <div className="top">
              <div><div className="meta">{[v.recipiente, v.data && v.data.split('-').reverse().join('/'), v.unidades ? `${v.unidades} un.` : 'unidades não registradas'].filter(Boolean).join(' · ')}</div><h3>{v.nome}</h3></div>
              <select className="status" aria-label={`Situação de ${v.nome}`} value={v.situacao || 'teste'} onChange={e => acoes.situacao(v.id, e.target.value)}>
                {Object.entries(SIT_VELA).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
              </select>
            </div>
            {v.base && <div className="meta">Base: {v.base}</div>}
            <Leitura ess={v.essencias || []} />
            {v.notas && <p className="note" style={{ margin: 0 }}>{v.notas}</p>}
            <div className="acts">
              <label className="f" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>Unidades
                <input type="number" min="0" key={v.id + '|' + v.unidades} defaultValue={v.unidades ?? ''} style={{ width: 70 }}
                  onBlur={e => { const x = e.target.value === '' ? null : +e.target.value; if (x !== (v.unidades ?? null)) acoes.unidades(v.id, x) }} /></label>
              <button className="btn small ghost" onClick={() => acoes.apagar(v.id)}>{confirmar === v.id ? 'Confirmar exclusão' : 'Excluir'}</button>
            </div>
          </article>
        ))}</div>
          : <div className="empty">{velas.length ? 'Nenhuma vela nesta situação.' : <>Nenhum lote registrado.<br /><br /><button className="btn" onClick={acoes.carregarIniciais}>Carregar as velas já produzidas</button></>}</div>}
    </>
  )
}
