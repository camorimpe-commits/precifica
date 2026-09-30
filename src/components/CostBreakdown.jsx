import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { PART_META } from '../utils/pricing'
import { formatBRL, formatPct } from '../utils/format'

/** Rosca + legenda mostrando para onde vai cada real do preço de venda. */
export default function CostBreakdown({ result }) {
  const { sellingPrice, values } = result

  const parts = PART_META.map((p) => ({ ...p, value: Number((values[p.key] ?? 0).toFixed(2)) })).filter(
    (p) => p.value > 0,
  )

  if (!result.isCalculable || parts.length === 0) return null

  return (
    <div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={parts} dataKey="value" nameKey="label" innerRadius="60%" outerRadius="95%" paddingAngle={2} stroke="none">
              {parts.map((p) => (
                <Cell key={p.key} fill={p.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 divide-y divide-line">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center justify-between py-2 text-sm">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-3 w-3 rounded-sm" style={{ background: p.color }} />
              {p.label}
            </span>
            <span className="tabular-nums">
              <strong className="text-white">{formatBRL(p.value)}</strong>
              <span className="ml-2 text-slate-500">{formatPct((p.value / sellingPrice) * 100)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
