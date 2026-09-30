import { useId } from 'react'

/** Campo numérico otimizado para celular (teclado decimal). Aceita vírgula ou ponto. */
export default function NumberField({ label, value, onChange, prefix, suffix, hint }) {
  const id = useId()

  const handleChange = (e) => {
    // mantém só dígitos e um separador decimal
    const cleaned = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
    const parts = cleaned.split('.')
    onChange(parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned)
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-300">
        {label}
      </label>
      <div className="flex items-center rounded-xl border border-line bg-ink px-3 focus-within:border-profit focus-within:ring-2 focus-within:ring-profit/30">
        {prefix && <span className="mr-2 text-slate-400">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={handleChange}
          onFocus={(e) => e.target.select()}
          className="min-w-0 flex-1 bg-transparent py-3 text-lg font-semibold tabular-nums text-white outline-none"
        />
        {suffix && <span className="ml-2 text-slate-400">{suffix}</span>}
      </div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
