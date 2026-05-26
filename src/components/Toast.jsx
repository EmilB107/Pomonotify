export function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50">
      {toasts.map(t => (
        <div
          key={t.id}
          className="px-4 py-2.5 rounded-2xl text-sm font-medium shadow-lg text-white bg-red-500"
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
