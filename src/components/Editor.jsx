import { useEffect, useRef, useState } from 'react'
import { PROD, STATUS, LAYN } from '../lib/dados.js'

const NOVA = { nome: '', produto: 'vela', status: 'ideia', linha: '', base: '110 g de cera de coco', baseNum: 110, camadas: { t: [['', 0]], c: [['', 0]], f: [['', 0]] } }

function preparar(r) {
  const e = JSON.parse(JSON.stringify(r || NOVA)); e.camadas = e.camadas || {}
  ;['t', 'c', 'f'].forEach(l => { if (!e.camadas[l] || !e.camadas[l].length) e.camadas[l] = [['', 0]] })
  return e
}

export default function Editor({ receita, onSalvar, onFechar, toast }) {
  const [e, setE] = useState(() => preparar(receita))
  const nomeRef = useRef(null)
  useEffect(() => { if (!e.nome && nomeRef.current) nomeRef.current.focus() }, []) // eslint-disable-line
  useEffect(() => {
    const k = ev => { if (ev.key === 'Escape') onFechar() }
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k)
  }, [onFechar])

  const set = (k, v) => setE(x => ({ ...x, [k]: v }))
  const setCam = (l, fn) => setE(x => ({ ...x, camadas: { ...x.camadas, [l]: fn(x.camadas[l]) } }))
  const salvar = async ev => {
    ev.preventDefault()
    const r = { ...e, nome: e.nome.trim(), linha: (e.linha || '').trim(), base: (e.base || '').trim(), baseNum: +e.baseNum || null,
      historia: (e.historia || '').trim(), fonte: (e.fonte || '').trim(), notas: (e.notas || '').trim(), camadas: {} }
    if (!r.nome) { toast('Dê um nome à receita.'); return }
    ;['t', 'c', 'f'].forEach(l => { r.camadas[l] = e.camadas[l].map(x => [String(x[0]).trim(), +x[1] || 0]).filter(x => x[0]) })
    await onSalvar(r)
  }

  return (
    <div className="ov" onClick={ev => { if (ev.target === ev.currentTarget) onFechar() }}>
      <form className="ed" role="dialog" aria-label="Editar receita" onSubmit={salvar}>
        <h2>{e.id ? 'Editar receita' : 'Nova receita'}</h2>
        <div className="g2">
          <label className="f">Nome (com a época, quando houver)<input ref={nomeRef} required value={e.nome} onChange={v => set('nome', v.target.value)} /></label>
          <label className="f">Produto<select value={e.produto} onChange={v => set('produto', v.target.value)}>{Object.entries(PROD).map(([k, p]) => <option key={k} value={k}>{p.n}</option>)}</select></label>
          <label className="f">Status<select value={e.status} onChange={v => set('status', v.target.value)}>{Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="f">Linha ou coleção<input value={e.linha || ''} onChange={v => set('linha', v.target.value)} /></label>
          <label className="f">Base (texto)<input value={e.base || ''} onChange={v => set('base', v.target.value)} /></label>
          <label className="f">Base para escalar (número)<input type="number" value={e.baseNum || ''} onChange={v => set('baseNum', v.target.value)} /></label>
        </div>
        {['t', 'c', 'f'].map(l => (
          <div className="edl" key={l}>
            <div className="row" style={{ justifyContent: 'space-between' }}><b className="eyebrow">{LAYN[l]}</b>
              <button type="button" className="btn small ghost" onClick={() => setCam(l, xs => [...xs, ['', 0]])}>+ essência</button></div>
            {e.camadas[l].map((x, i) => (
              <div className="r" key={i}>
                <input list="notas-list" placeholder="Essência" value={x[0]} aria-label={`Essência do ${LAYN[l].toLowerCase()}`}
                  onChange={v => setCam(l, xs => xs.map((y, j) => j === i ? [v.target.value, y[1]] : y))} />
                <input type="number" step="0.1" min="0" placeholder="g" value={x[1] || ''} aria-label="Gramas"
                  onChange={v => setCam(l, xs => xs.map((y, j) => j === i ? [y[0], v.target.value] : y))} />
                <button type="button" className="btn small ghost" aria-label="Remover"
                  onClick={() => setCam(l, xs => { const n = xs.filter((_, j) => j !== i); return n.length ? n : [['', 0]] })}>×</button>
              </div>
            ))}
          </div>
        ))}
        <p className="note">Doses em gramas. O app mostra também ml e gotas. Regra: topo maior que coração, coração maior que fundo.</p>
        <label className="f">História<textarea rows="2" value={e.historia || ''} onChange={v => set('historia', v.target.value)} /></label>
        <label className="f">Fonte pesquisada<input value={e.fonte || ''} onChange={v => set('fonte', v.target.value)} /></label>
        <label className="f">Notas<textarea rows="2" value={e.notas || ''} onChange={v => set('notas', v.target.value)} /></label>
        <div className="row"><button className="btn" type="submit">Salvar</button><button type="button" className="btn ghost" onClick={onFechar}>Cancelar</button></div>
      </form>
    </div>
  )
}
