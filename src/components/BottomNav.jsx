import { TABS } from '../constants/tabs'

export default function BottomNav({ active, onChange, savedCount }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-ink/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <li key={id} className="flex-1">
              <button
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex w-full flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-profit ${
                  isActive ? 'text-profit' : 'text-slate-400'
                }`}
              >
                <Icon size={22} />
                {label}
                {id === 'saved' && savedCount > 0 && (
                  <span className="absolute right-[28%] top-1.5 rounded-full bg-profit px-1.5 text-[10px] font-bold text-ink">
                    {savedCount}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
