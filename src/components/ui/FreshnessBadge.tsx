import type { Freshness } from "../../types"
import { daysLeftLabel } from "../../utils/date"

const styles: Record<Freshness, string> = {
  fresh: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  expiring: "bg-amber-100 text-amber-800 ring-amber-200",
  expired: "bg-red-100 text-red-800 ring-red-200"
}

const dots: Record<Freshness, string> = {
  fresh: "bg-emerald-500",
  expiring: "bg-amber-500",
  expired: "bg-red-500"
}

const names: Record<Freshness, string> = { fresh: "Fresh", expiring: "Expiring soon", expired: "Expired" }




export default function FreshnessBadge({ freshness, daysLeft }: { freshness: Freshness; daysLeft: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[freshness]}`}
      title={names[freshness]}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[freshness]}`} aria-hidden="true" />
      <span className="sr-only">{names[freshness]}: </span>
      {daysLeftLabel(daysLeft)}
    </span>
  )
}
