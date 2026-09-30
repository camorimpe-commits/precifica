import { Trash2, Pencil, Bookmark } from 'lucide-react'
import Card from './Card'
import { formatBRL, formatPct } from '../utils/format'

export default function SavedTab({ products, onLoad, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-slate-400">
        <Bookmark size={40} />
        <p className="font-semibold text-slate-200">Nenhum produto salvo ainda</p>
        <p className="text-sm">Calcule um preço e toque em “Salvar produto” para guardá-lo aqui.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {products.map((p) => (
        <li key={p.id}>
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-white">{p.name}</h3>
                <p className="text-xs text-slate-500">Salvo em {p.createdAt}</p>
              </div>
              <p className="text-2xl font-extrabold tabular-nums text-white">{formatBRL(p.sellingPrice)}</p>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Custo {formatBRL(p.directCost)} · Lucro <strong className="text-profit">{formatBRL(p.profitVal)}</strong> (
              {formatPct(p.desiredProfitPct)})
            </p>
            <div className="mt-3 flex gap-2 border-t border-line pt-3">
              <button
                onClick={() => onLoad(p)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line py-2 text-sm font-semibold text-slate-200 active:scale-[0.98]"
              >
                <Pencil size={16} /> Editar
              </button>
              <button
                onClick={() => onDelete(p.id)}
                aria-label={`Excluir ${p.name}`}
                className="flex items-center justify-center rounded-lg border border-red-500/40 px-4 text-red-400 active:scale-[0.98]"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}
