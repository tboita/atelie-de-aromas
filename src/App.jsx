import { useCallback, useEffect, useRef, useState } from 'react'
import { NOTES, FAM, PROD, TIPOS, ABAS, noteFor, keyOf, fmt, hoje } from './lib/dados.js'
import { emEstoque, faltantes } from './lib/logica.js'
import { configurado } from './lib/supabase.js'
import { COLECOES, uid, lerCache, gravarCache, carregarTudo, gravar, apagar, substituirTudo, paraCopia, aplicarNovidades, versaoAplicada, marcarVersao, VERSAO_DADOS } from './lib/db.js'
import Circulo from './components/Circulo.jsx'
import Receitas from './components/Receitas.jsx'
import Estoque from './components/Estoque.jsx'
import Compras from './components/Compras.jsx'
import Diario from './components/Diario.jsx'
import Editor from './components/Editor.jsx'
import Bancada from './components/Bancada.jsx'
import Velas from './components/Velas.jsx'

const VAZIO = { receitas: [], estoque: [], compras: [], diario: [], velas: [] }
const ICONES = {
  circulo: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" /><path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21" /></>,
  receitas: <><path d="M6 3h10l3 3v15H6z" /><path d="M9 9h7M9 13h7M9 17h4" /></>,
  velas: <><path d="M7 10h10v10a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z" /><path d="M12 10V7" /><path d="M12 3c1.2 1.4 1.5 2.2 0 4-1.5-1.8-1.2-2.6 0-4z" /></>,
  estoque: <><path d="M9 3h6M10 3v4l-4 5v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8l-4-5V3" /><path d="M6 14h12" /></>,
  compras: <><path d="M5 8h14l-1.5 12h-11z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  diario: <><path d="M12 3c2 3 4 4.5 4 8a4 4 0 0 1-8 0c0-2 1-3 1.5-4 .5 1.5 1.5 2 2.5 2 0-2-.5-4 0-6z" /><path d="M8 21h8" /></>
}
const NOMES = { circulo: 'Círculo', receitas: 'Receitas', velas: 'Velas', estoque: 'Estoque', compras: 'Compras', diario: 'Diário' }
const abaDoHash = () => { const h = location.hash.slice(1); return ABAS.includes(h) ? h : 'circulo' }

export default function App() {
  const [dados, setDados] = useState(() => ({ ...VAZIO, ...(lerCache() || {}) }))
  const [carregado, setCarregado] = useState(() => !!lerCache())
  const [sync, setSync] = useState(configurado ? 'carregando' : 'off')
  const [tab, setTab] = useState(abaDoHash)
  const [ui, setUi] = useState({ seed: 'Flor de laranjeira', seedLayer: null, produto: 'vela', base: 110, dose: 9.1, variant: 0, fam: 8, prop: 0 })
  const [filtros, setFiltros] = useState({ fSt: 'todas', fPr: 'todos', busca: '' })
  const [escala, setEscala] = useState({})
  const [confirmar, setConfirmar] = useState(null)
  const [diarioPre, setDiarioPre] = useState(null)
  const [edit, setEdit] = useState(null)
  const [bancada, setBancada] = useState(null)
  const [msg, setMsg] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const dadosRef = useRef(dados); dadosRef.current = dados
  const tmToast = useRef(null)

  const toast = useCallback(m => { setMsg(m); clearTimeout(tmToast.current); tmToast.current = setTimeout(() => setMsg(null), 2600) }, [])

  const recarregar = useCallback(async () => {
    if (!configurado) return
    try {
      let d = await carregarTudo()
      const temDados = COLECOES.some(c => d[c].length)
      if (temDados && versaoAplicada() < VERSAO_DADOS) {
        const novos = await aplicarNovidades(d)
        const n = Object.values(novos).reduce((a, xs) => a + xs.length, 0)
        if (n) { d = { ...d }; Object.entries(novos).forEach(([c, xs]) => { d[c] = [...d[c], ...xs] }); toast(`${n} novidade${n > 1 ? 's' : ''} do ateliê adicionada${n > 1 ? 's' : ''} à nuvem.`) }
      }
      setDados(d); gravarCache(d); setCarregado(true); setSync('on')
    } catch { setSync('off') }
  }, [toast])

  useEffect(() => { recarregar() }, [recarregar])
  useEffect(() => {
    const vis = () => { if (document.visibilityState === 'visible') recarregar() }
    document.addEventListener('visibilitychange', vis); window.addEventListener('online', recarregar)
    return () => { document.removeEventListener('visibilitychange', vis); window.removeEventListener('online', recarregar) }
  }, [recarregar])
  useEffect(() => {
    const h = () => setTab(abaDoHash())
    window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h)
  }, [])
  useEffect(() => { try { navigator.storage && navigator.storage.persist && navigator.storage.persist() } catch { /* opcional */ } }, [])

  const irPara = t => { setTab(t); setConfirmar(null); try { history.replaceState(null, '', '#' + t) } catch { location.hash = t } window.scrollTo(0, 0) }

  /* Gravação: atualiza a tela na hora e confirma na nuvem; se falhar, recarrega da nuvem */
  const aplicar = (c, fn) => setDados(d => { const n = { ...d, [c]: fn(d[c]) }; gravarCache(n); return n })
  async function salvar(local, remoto, okMsg) {
    if (!configurado) { toast('Configure o Supabase para salvar.'); return false }
    local()
    try { await remoto(); if (okMsg) toast(okMsg); setSync('on'); return true }
    catch { toast(navigator.onLine ? 'Não foi possível salvar. Tente de novo.' : 'Sem internet: nada foi salvo.'); recarregar(); return false }
  }
  const adicionar = (c, d, okMsg) => { const item = { ...d, id: uid() }; return salvar(() => aplicar(c, xs => [...xs, item]), () => gravar(c, item), okMsg) }
  const atualizar = (c, id, patch, okMsg) => {
    const atual = dadosRef.current[c].find(x => x.id === id); if (!atual) return Promise.resolve(false)
    const item = { ...atual, ...patch }
    return salvar(() => aplicar(c, xs => xs.map(x => x.id === id ? item : x)), () => gravar(c, item), okMsg)
  }
  const remover = (c, id, okMsg) => salvar(() => aplicar(c, xs => xs.filter(x => x.id !== id)), () => apagar(c, id), okMsg)
  const comConfirmacao = (id, fn) => { if (confirmar !== id) { setConfirmar(id); return } setConfirmar(null); fn() }

  async function addCompras(nomes, produto, motivo) {
    if (!nomes.length) { toast('Nada a comprar: está tudo no estoque.'); return }
    const tipo = (PROD[produto] || PROD.vela).tipos[0]; const ex = new Set(dadosRef.current.compras.map(c => keyOf(c.nome)))
    const novos = [...new Set(nomes)].filter(n => !ex.has(keyOf(n)))
    if (!novos.length) { toast('Esses itens já estão na lista avulsa.'); return }
    const itens = novos.map(n => ({ nome: n, tipo, obs: `${TIPOS[tipo]} · ${motivo}`, feito: false, id: uid() }))
    await salvar(() => aplicar('compras', xs => [...xs, ...itens]), () => Promise.all(itens.map(i => gravar('compras', i))),
      `${novos.length} item${novos.length > 1 ? 's' : ''} na lista de compras.`)
  }

  async function restaurar(d) {
    if (!configurado) { toast('Configure o Supabase para restaurar.'); return }
    setOcupado(true)
    try { const n = await substituirTudo(d); setDados(x => { const m = { ...x, ...n }; gravarCache(m); return m }); setCarregado(true); toast('Dados restaurados.') }
    catch { toast('Não foi possível restaurar. Tente de novo.'); recarregar() }
    setOcupado(false)
  }
  async function carregarIniciais() { const seed = (await import('./lib/seed.json')).default; await restaurar(seed); marcarVersao() }

  async function salvarCopia() {
    const txt = JSON.stringify({ app: 'atelie-de-aromas', versao: 2, data: new Date().toISOString(), dados: paraCopia(dadosRef.current) }, null, 1)
    const nome = `atelie-de-aromas-${hoje()}.json`
    try {
      const file = new File([txt], nome, { type: 'application/json' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Cópia do Ateliê de Aromas' }); return }
    } catch (e) { if (e && e.name === 'AbortError') return }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = nome
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 1000)
    toast('Cópia salva.')
  }

  /* Ações por tela */
  const acoesCirculo = {
    salvarProp: p => {
      const P = PROD[ui.produto]; const cam = {}
      ;['t', 'c', 'f'].forEach(l => { cam[l] = p.cam[l] ? [[p.cam[l].nome, p.g[l]]] : [] })
      return adicionar('receitas', { nome: `${noteFor(ui.seed).nome}, ${p.nome.toLowerCase()}`, produto: ui.produto, status: 'ideia', linha: 'Círculo de aromas',
        base: `${fmt(ui.base)} ${P.un} · essência ${fmt(ui.dose)}%`, baseNum: ui.base, camadas: cam, criado: hoje(), ordem: 900 }, 'Salva em Receitas, como “A criar”.')
    },
    comprarProp: p => addCompras(['t', 'c', 'f'].map(l => p.cam[l]).filter(n => n && !emEstoque(dados.estoque, n.nome, ui.produto)).map(n => n.nome), ui.produto, `Círculo: ${noteFor(ui.seed).nome}`),
    abrirReceita: nome => { setFiltros({ fSt: 'todas', fPr: 'todos', busca: nome }); irPara('receitas') }
  }
  const acoesReceitas = {
    status: (id, s) => atualizar('receitas', id, { status: s, atualizado: hoje() }, 'Status atualizado.'),
    nova: () => setEdit({}),
    editar: r => setEdit(r),
    bancada: id => setBancada(id),
    testar: r => { setDiarioPre({ receita: r.nome, base: r.base || '', data: hoje() }); irPara('diario') },
    comprar: r => addCompras(faltantes(r, dados.estoque), r.produto, r.nome),
    apagar: id => comConfirmacao(id, () => remover('receitas', id, 'Receita excluída.'))
  }
  const salvarReceita = async r => {
    const data = { ...r, atualizado: hoje() }
    const ok = data.id ? await atualizar('receitas', data.id, data, 'Receita salva.') : await adicionar('receitas', { ...data, ordem: data.ordem ?? 900 }, 'Receita salva.')
    if (ok) setEdit(null)
  }
  const acoesEstoque = {
    adicionar: d => adicionar('estoque', d, 'Adicionado ao estoque.'),
    qtd: (id, v) => atualizar('estoque', id, { qtd: v }, 'Quantidade salva.'),
    sit: i => atualizar('estoque', i.id, { situacao: { tenho: 'acabando', acabando: 'acabou', acabou: 'tenho' }[i.situacao || 'tenho'] }),
    apagar: id => comConfirmacao(id, () => remover('estoque', id, 'Removido do estoque.')),
    comprarFundo: (nome, produto) => addCompras([nome], produto, 'Sugestão de fundo'),
    salvarCopia, restaurar
  }
  const acoesCompras = {
    adicionar: d => adicionar('compras', d, 'Adicionado à lista.'),
    comprei: (nome, tipo) => adicionar('estoque', { nome, tipo, fornecedor: '', qtd: '', situacao: 'tenho', obs: 'Comprado em ' + hoje().split('-').reverse().join('/') }, `${nome} foi para o estoque.`),
    reposto: id => atualizar('estoque', id, { situacao: 'tenho' }, 'Atualizado no estoque.'),
    feito: (id, v) => atualizar('compras', id, { feito: v }),
    paraEstoque: async c => { if (await adicionar('estoque', { nome: c.nome, tipo: c.tipo || 'insumo', fornecedor: c.obs || '', qtd: '', situacao: 'tenho' }, `${c.nome} foi para o estoque.`)) await remover('compras', c.id) },
    apagar: id => comConfirmacao(id, () => remover('compras', id))
  }
  const acoesVelas = {
    adicionar: d => adicionar('velas', d, 'Lote registrado.'),
    situacao: (id, s) => atualizar('velas', id, { situacao: s }, 'Situação atualizada.'),
    unidades: (id, n) => atualizar('velas', id, { unidades: n }, 'Unidades salvas.'),
    apagar: id => comConfirmacao(id, () => remover('velas', id, 'Lote excluído.')),
    carregarIniciais: async () => { const seed = (await import('./lib/seed.json')).default; await restaurar({ velas: seed.velas }) }
  }
  const acoesDiario = {
    adicionar: d => adicionar('diario', d, 'Teste registrado.'),
    apagar: id => comConfirmacao(id, () => remover('diario', id))
  }

  const recBancada = bancada && dados.receitas.find(r => r.id === bancada)
  const fecharEditor = useCallback(() => setEdit(null), [])
  const fecharBancada = useCallback(() => setBancada(null), [])
  const vazio = carregado && sync === 'on' && COLECOES.every(c => !dados[c].length)
  const syncTxt = { carregando: 'Conectando à nuvem…', on: 'Salvo na nuvem', off: configurado ? 'Sem conexão: mostrando a última cópia' : 'Nuvem não configurada' }[sync]

  return (
    <>
      <header>
        <div className="wrap">
          <div className="sig">
            <small>Velas da Memória</small>
            <h1>Ateliê de Aromas</h1>
            <p>Círculo de aromas, receitas, estoque e compras num lugar só. Toda fórmula com topo, coração e fundo.</p>
            <div className={`sync ${sync}`}><i />{syncTxt}</div>
          </div>
          <nav aria-label="Seções">
            {ABAS.map(t => (
              <button key={t} aria-current={tab === t ? 'page' : 'false'} onClick={() => irPara(t)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">{ICONES[t]}</svg>{NOMES[t]}{t === 'diario' && <span className="lg">&nbsp;de testes</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main><div className="wrap">
        {!configurado && <div className="card setup" style={{ marginBottom: 20 }}>
          <h3>Falta ligar o Supabase</h3>
          <p className="note">Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no arquivo <code>.env</code> (local) ou nas variáveis de ambiente da Vercel. O Círculo funciona mesmo assim; receitas, estoque e compras dependem da nuvem.</p>
        </div>}
        {vazio && <div className="card setup" style={{ marginBottom: 20 }}>
          <h3>A nuvem está vazia</h3>
          <p className="note" style={{ margin: '4px 0 10px' }}>Comece com as receitas, o estoque e as compras que já estavam no app, ou restaure uma cópia de segurança em Estoque.</p>
          <div className="row"><button className="btn" disabled={ocupado} onClick={carregarIniciais}>{ocupado ? 'Carregando…' : 'Carregar dados iniciais do ateliê'}</button>
            <button className="btn ghost" onClick={() => irPara('estoque')}>Restaurar cópia</button></div>
        </div>}
        {tab === 'circulo' && <Circulo ui={ui} setUi={setUi} estoque={dados.estoque} receitas={dados.receitas} toast={toast}
          onSalvarProp={acoesCirculo.salvarProp} onComprarProp={acoesCirculo.comprarProp} onAbrirReceita={acoesCirculo.abrirReceita} />}
        {tab === 'receitas' && <Receitas receitas={dados.receitas} estoque={dados.estoque} carregado={carregado || !configurado} filtros={filtros} setFiltros={setFiltros}
          escala={escala} setEscala={setEscala} confirmar={confirmar} acoes={acoesReceitas} />}
        {tab === 'velas' && <Velas velas={dados.velas} receitas={dados.receitas} carregado={carregado || !configurado} confirmar={confirmar} acoes={acoesVelas} />}
        {tab === 'estoque' && <Estoque estoque={dados.estoque} receitas={dados.receitas} carregado={carregado || !configurado} confirmar={confirmar} acoes={acoesEstoque} toast={toast} />}
        {tab === 'compras' && <Compras receitas={dados.receitas} estoque={dados.estoque} compras={dados.compras} carregado={carregado || !configurado} confirmar={confirmar} acoes={acoesCompras} />}
        {tab === 'diario' && <Diario receitas={dados.receitas} diario={dados.diario} carregado={carregado || !configurado} pre={diarioPre} limparPre={() => setDiarioPre(null)}
          confirmar={confirmar} acoes={acoesDiario} />}
      </div></main>
      <datalist id="notas-list">{NOTES.map(n => <option key={n.nome} value={n.nome}>{FAM[n.f].n}</option>)}</datalist>
      {edit && <Editor receita={edit.id ? edit : null} onSalvar={salvarReceita} onFechar={fecharEditor} toast={toast} />}
      {recBancada && <Bancada r={recBancada} baseInicial={escala[recBancada.id]} onFechar={fecharBancada}
        onDiario={base => { const P = PROD[recBancada.produto] || PROD.vela; setDiarioPre({ receita: recBancada.nome, base: base ? `${fmt(base)} ${P.un}` : (recBancada.base || ''), data: hoje() }); setBancada(null); irPara('diario') }} />}
      <div className="toast" hidden={!msg}>{msg}</div>
    </>
  )
}
