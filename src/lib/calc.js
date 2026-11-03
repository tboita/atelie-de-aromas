/* Calculadora proporcional: tudo deriva de M, a base por unidade (g, ou ml no sabonete líquido) */
import { PROD } from './dados.js'
import { camadasDe } from './logica.js'

/* fator = gramas de base por ml de água do recipiente (já descontando a folga da borda) */
export const MODELOS = {
  vela: { fator: 0.86, dose: 9.1, base: 110, un: 'g', ings: [['Cera de coco', 1]],
    dica: 'Cera derretida pesa cerca de 0,9 g por ml, e a vela fica 1 cm abaixo da borda: por isso 0,86 g de cera por ml de água.' },
  sabonete: { fator: 1.0, dose: 3, base: 261, un: 'g', ings: [['Base glicerinada', 0.943], ['Manteiga', 0.034], ['Óleo de babaçu', 0.023]],
    dica: 'Base glicerinada pesa cerca de 1 g por ml. A forma enche até a borda.' },
  manteiga: { fator: 0.8, dose: 1, base: 50, un: 'g', ings: [['Manteiga', 0.707], ['Óleo de babaçu', 0.273], ['Polvilho doce', 0.02]],
    dica: 'Batida, a manteiga ganha ar e pesa menos que água: cerca de 0,8 g por ml. Confira no primeiro lote e ajuste.' },
  liquido: { fator: 0.95, dose: 0.5, base: 250, un: 'ml', ings: [['Base líquida', 0.99], ['Extrato glicólico', 0.01]],
    dica: 'Tudo em ml. Deixe 5% do frasco livre para a válvula.' },
  cabelo: { fator: 1.0, dose: 1, base: 100, un: 'g', ings: [['Base da barra', 1]],
    dica: 'Escolha a receita do shampoo ou do condicionador para ver cada ingrediente.' }
}

const num = s => +String(s).replace(',', '.')

/* "Base 246 g, manga 9 g" ou "110 g de cera de coco" viram [[nome, quantidade], ...] */
export function lerBase(txt) {
  const out = []
  String(txt || '').split(/,(?!\d)|;|·/).map(x => x.trim()).filter(Boolean).forEach(p => {
    let m = p.match(/^(\d+(?:[.,]\d+)?)\s*(g|ml)\s+(?:de\s+)?(.+)$/i)
    if (m) { out.push([m[3].trim(), num(m[1])]); return }
    m = p.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(g|ml)$/i)
    if (m) out.push([m[1].trim(), num(m[2])])
  })
  return out.filter(([n, q]) => q > 0 && !/ess[eê]ncia/i.test(n)).map(([n, q]) => [n.charAt(0).toUpperCase() + n.slice(1), q])
}

/* Monta a "planta" de cálculo: ingredientes da base (proporções), essências (proporções) e dose */
export function planta(prod, receita) {
  const mod = MODELOS[prod] || MODELOS.vela
  const P = PROD[prod] || PROD.vela
  let ings = mod.ings.map(([n, p]) => ({ nome: n, p }))
  let base = mod.base, dose = mod.dose, ref = null
  let ess = [{ nome: 'Topo', camada: 't', p: 0.40 }, { nome: 'Coração', camada: 'c', p: 0.35 }, { nome: 'Fundo', camada: 'f', p: 0.25 }]
  if (receita) {
    const lidos = lerBase(receita.base)
    const soma = lidos.reduce((a, x) => a + x[1], 0)
    if (soma > 0) { ings = lidos.map(([n, q]) => ({ nome: n, p: q / soma })); base = soma }
    else if (receita.baseNum) base = receita.baseNum
    ref = base
    const es = camadasDe(receita).flatMap(([l, xs]) => xs.map(x => ({ nome: x[0], camada: l, g: +x[1] || 0 })))
    const se = es.reduce((a, x) => a + x.g, 0)
    if (se > 0) { ess = es.map(x => ({ nome: x.nome, camada: x.camada, p: x.g / se })); dose = se / base * 100 }
    else if (es.length) ess = es.map(x => ({ nome: x.nome, camada: x.camada, p: 1 / es.length }))
  }
  return { ings, ess, base, dose, ref, fator: mod.fator, un: mod.un, dica: mod.dica, lim: P.lim || null }
}
