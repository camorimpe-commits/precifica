/**
 * Regras de precificação (Markup Divisor).
 *
 * Preço de venda = Custo direto / (1 - soma das % sobre o preço)
 *
 * Todas as funções são puras: recebem números e devolvem números.
 * Isso facilita testar e reaproveitar (ex.: futura API ou app nativo).
 */

/**
 * @typedef {Object} PricingParams
 * @property {number} directCost        Custo direto do produto (R$)
 * @property {number} fixedCostPct      Custos fixos (% do preço)
 * @property {number} variableCostPct   Custos variáveis (% do preço)
 * @property {number} taxPct            Impostos (% do preço)
 * @property {number} desiredProfitPct  Lucro desejado (% do preço)
 */

export const PART_META = [
  { key: 'directCost', label: 'Custo direto', color: '#3B82F6' },
  { key: 'fixedCost', label: 'Custos fixos', color: '#6366F1' },
  { key: 'variableCost', label: 'Custos variáveis', color: '#EC4899' },
  { key: 'tax', label: 'Impostos', color: '#F59E0B' },
  { key: 'profit', label: 'Lucro líquido', color: '#10B981' },
]

/**
 * @param {PricingParams} params
 * @param {number} [extraPct=0] Porcentagem extra sobre o preço (ex.: taxa do marketplace)
 */
export function calcPrice(params, extraPct = 0) {
  const { directCost, fixedCostPct, variableCostPct, taxPct, desiredProfitPct } = params

  const deductionPct = fixedCostPct + variableCostPct + taxPct + desiredProfitPct + extraPct
  const isCalculable = deductionPct >= 0 && deductionPct < 100
  const divisor = isCalculable ? 1 - deductionPct / 100 : 0
  const sellingPrice = divisor > 0 ? directCost / divisor : 0

  const at = (pct) => sellingPrice * (pct / 100)

  const values = {
    directCost,
    fixedCost: at(fixedCostPct),
    variableCost: at(variableCostPct),
    tax: at(taxPct),
    extra: at(extraPct),
    profit: at(desiredProfitPct),
  }

  return { deductionPct, isCalculable, divisor, sellingPrice, values }
}

/** Dado um preço alvo, qual o maior custo direto que ainda entrega o lucro desejado? */
export function calcMaxDirectCost(targetPrice, params) {
  const { isCalculable, divisor } = calcPrice(params)
  return isCalculable ? targetPrice * divisor : 0
}

/** Dado um preço e um custo, qual o lucro real (R$ e %)? */
export function calcRealProfit(price, params) {
  if (price <= 0) return { profitVal: 0, profitPct: 0 }
  const { directCost, fixedCostPct, variableCostPct, taxPct } = params
  const costsOnPrice = price * ((fixedCostPct + variableCostPct + taxPct) / 100)
  const profitVal = price - directCost - costsOnPrice
  return { profitVal, profitPct: (profitVal / price) * 100 }
}
