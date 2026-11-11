import type { ReactNode } from "react"

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      <div className="mb-3 text-5xl" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
