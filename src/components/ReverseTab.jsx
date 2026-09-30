import { useState } from 'react'
import Card from './Card'
import Notice from './Notice'
import NumberField from './NumberField'
import { calcMaxDirectCost, calcRealProfit } from '../utils/pricing'
import { formatBRL, formatPct, toNum } from '../utils/format'

export default function ReverseTab({ params, result }) {
  const [targetPrice, setTargetPrice] = useState('100')
  const price = toNum(targetPrice)

  if (!result.isCalculable) {
    return <Notice>Ajuste as porcentagens na aba Calcular (a soma deve ser menor que 100%) para usar o preço alvo.</Notice>
  }

  const maxCost = calcMaxDirectCost(price, params)
  const real = calcRealProfit(price, params)
  const withinBudget = params.directCost <= maxCost

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        O mercado já paga um preço? Descubra quanto seu produto pode custar para ainda dar o lucro desejado.
      </p>

      <Card>
        <NumberField label="Preço praticado no mercado" prefix="R$" value={targetPrice} onChange={setTargetPrice} />
      </Card>

      <section className="rounded-2xl bg-profit p-5 text-ink">
        <p className="text-sm font-bold">Custo direto máximo</p>
        <p className="mt-1 text-5xl font-extrabold tabular-nums tracking-tight">{formatBRL(maxCost)}</p>
        <p className="mt-2 text-sm font-semibold">para manter {formatPct(params.desiredProfitPct)} de lucro</p>
      </section>

      {price > 0 &&
        (withinBudget ? (
          <Notice type="success">
            Seu custo atual ({formatBRL(params.directCost)}) cabe nesse preço. Lucro real: {formatBRL(real.profitVal)} por
            unidade ({formatPct(real.profitPct)}).
          </Notice>
        ) : (
          <Notice>
            Seu custo atual ({formatBRL(params.directCost)}) passa do limite. Nesse preço o lucro real seria{' '}
            {formatBRL(real.profitVal)} por unidade ({formatPct(real.profitPct)}), abaixo dos{' '}
            {formatPct(params.desiredProfitPct)} desejados.
          </Notice>
        ))}
    </div>
  )
}
