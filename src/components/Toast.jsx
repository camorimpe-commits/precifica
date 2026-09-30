export default function Toast({ message }) {
  if (!message) return null
  return (
    <div
      role="status"
      className="fixed inset-x-4 z-30 mx-auto max-w-md rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-ink shadow-lg"
      style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
    >
      {message}
    </div>
  )
}
