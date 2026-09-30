import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function Notice({ type = 'warning', children }) {
  const ok = type === 'success'
  const Icon = ok ? CheckCircle : AlertTriangle
  const style = ok
    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
    : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
  return (
    <div role={ok ? 'status' : 'alert'} className={`flex gap-2 rounded-xl border p-3 text-sm ${style}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
