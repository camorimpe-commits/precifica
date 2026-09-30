export default function Card({ title, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-line bg-panel p-4 ${className}`}>
      {title && <h2 className="mb-3 text-base font-bold text-white">{title}</h2>}
      {children}
    </section>
  )
}
