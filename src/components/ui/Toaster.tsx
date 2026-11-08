import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { removeToast } from "../../store/slices/uiSlice"
import type { Toast } from "../../store/slices/uiSlice"

const styles: Record<Toast["type"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-sky-200 bg-sky-50 text-sky-800"
}

const icons: Record<Toast["type"], string> = { success: "✓", error: "!", info: "i" }

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 4500)
    return () => clearTimeout(timer)
  }, [dispatch, toast.id])

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`animate-toast-in flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg ${styles[toast.type]}`}
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs font-bold">
        {icons[toast.type]}
      </span>
      <p className="flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => dispatch(removeToast(toast.id))}
        aria-label="Dismiss notification"
        className="opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}

export default function Toaster() {
  const toasts = useAppSelector((s) => s.ui.toasts)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      <div className="pointer-events-auto flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </div>
  )
}