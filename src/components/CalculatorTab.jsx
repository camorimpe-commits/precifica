import { Save, RotateCcw } from 'lucide-react'
import Card from './Card'
import Notice from './Notice'
import NumberField from './NumberField'
import CostBreakdown from './CostBreakdown'
import { formatBRL, formatPct } from '../utils/format'

export default function CalculatorTab({ form, result, setField, onSave, onReset }) {
  const { isCalculable, sellingPrice, values, deductionPct } = result

  return (
    <div className="space-y-4">
      {/* Resultado: o número mais importante fica sempre no topo */}
      <section className="rounded-2xl bg-profit p-5 text-ink">
        <p className="text-sm font-bold">Preço de venda ideal</p>
        <p className="mt-1 text-5xl font-extrabold tabular-nums tracking-tight">
          {isCalculable ? formatBRL(sellingPrice) : '—'}
        </p>
        {isCalculable && (
          <p className="mt-2 text-sm font-semibold">
            Você fica com {formatBRL(values.profit)} de lucro por unidade
          </p>
        )}
      </section>

      {!isCalculable && (
        <Notice>
          As porcentagens somam {formatPct(deductionPct)}. Para calcular, a soma precisa ser menor que 100%.
          Reduza custos, impostos ou o lucro desejado.
        </Notice>
      )}

      <Card title="Produto">
        <div className="space-y-4">
          <div>
            <label htmlFor="product-name" className="mb-1.5 block text-sm font-semibold text-slate-300">
              Nome do produto
            </label>
            <input
              id="product-name"
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Ex.: Camiseta básica"
              className="w-full rounded-xl border border-line bg-ink px-3 py-3 text-lg font-semibold text-white outline-none placeholder:text-slate-600 focus:border-profit focus:ring-2 focus:ring-profit/30"
            />
          </div>
          <NumberField label="Custo direto" prefix="R$" value={form.directCost} onChange={(v) => setField('directCost', v)} hint="Matéria-prima, compra ou produção de 1 unidade" />
        </div>
      </Card>

      <Card title="Porcentagens sobre o preço de venda">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Custos fixos" suffix="%" value={form.fixedCostPct} onChange={(v) => setField('fixedCostPct', v)} />
          <NumberField label="Custos variáveis" suffix="%" value={form.variableCostPct} onChange={(v) => setField('variableCostPct', v)} />
          <NumberField label="Impostos" suffix="%" value={form.taxPct} onChange={(v) => setField('taxPct', v)} />
          <NumberField label="Lucro desejado" suffix="%" value={form.desiredProfitPct} onChange={(v) => setField('desiredProfitPct', v)} />
        </div>
      </Card>

      {isCalculable && (
        <Card title="Para onde vai cada real">
          <CostBreakdown result={result} />
        </Card>
      )}

      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-bold text-ink active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-profit"
        >
          <Save size={20} /> Salvar produto
        </button>
        <button
          onClick={onReset}
          aria-label="Limpar campos"
          className="flex items-center justify-center rounded-xl border border-line px-4 text-slate-300 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-profit"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  )
}
