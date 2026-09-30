const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const pct = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

export const formatBRL = (value) => brl.format(Number.isFinite(value) ? value : 0)
export const formatPct = (value) => `${pct.format(Number.isFinite(value) ? value : 0)}%`

/** Converte texto digitado ("12,5" ou "12.5") em número. Vazio/inválido vira 0. */
export function toNum(value) {
  const n = parseFloat(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
