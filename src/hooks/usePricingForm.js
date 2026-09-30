import { useMemo, useState } from 'react'
import { calcPrice } from '../utils/pricing'
import { toNum } from '../utils/format'

// Os campos ficam como texto para permitir apagar/digitar livremente ("12,")
const DEFAULTS = {
  name: '',
  directCost: '50',
  fixedCostPct: '10',
  variableCostPct: '5',
  taxPct: '6',
  desiredProfitPct: '20',
}

export function usePricingForm() {
  const [form, setForm] = useState(DEFAULTS)

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const reset = () => setForm(DEFAULTS)

  const load = (product) =>
    setForm({
      name: product.name,
      directCost: String(product.directCost),
      fixedCostPct: String(product.fixedCostPct),
      variableCostPct: String(product.variableCostPct),
      taxPct: String(product.taxPct),
      desiredProfitPct: String(product.desiredProfitPct),
    })

  const params = useMemo(
    () => ({
      directCost: toNum(form.directCost),
      fixedCostPct: toNum(form.fixedCostPct),
      variableCostPct: toNum(form.variableCostPct),
      taxPct: toNum(form.taxPct),
      desiredProfitPct: toNum(form.desiredProfitPct),
    }),
    [form],
  )

  const result = useMemo(() => calcPrice(params), [params])

  return { form, params, result, setField, reset, load }
}
