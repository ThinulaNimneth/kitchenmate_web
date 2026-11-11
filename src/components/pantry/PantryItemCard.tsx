import type { PantryItem } from "../../types"
import { formatDate } from "../../utils/date"
import Button from "../ui/Button"
import FreshnessBadge from "../ui/FreshnessBadge"

interface PantryItemCardProps {
  item: PantryItem
  onEdit: (item: PantryItem) => void
  onDelete: (item: PantryItem) => void
  onStatus: (item: PantryItem, status: PantryItem["status"]) => void
  onAddToList: (item: PantryItem) => void
}

const borderByFreshness = {
  fresh: "border-l-emerald-500",
  expiring: "border-l-amber-400",
  expired: "border-l-red-500"
} as const

export default function PantryItemCard({ item, onEdit, onDelete, onStatus, onAddToList }: PantryItemCardProps) {
  const isActive = item.status === "ACTIVE"

  return (
    <article
      className={`flex flex-col rounded-2xl border border-stone-200 border-l-4 bg-white p-4 shadow-sm ${
        isActive ? borderByFreshness[item.freshness] : "border-l-stone-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-stone-900">{item.name}</h3>
          <p className="mt-0.5 text-sm text-stone-500">
            {item.quantity} {item.unit}
          </p>
        </div>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: `${item.category?.color ?? "#64748b"}22` }}
          title={item.category?.name}
          aria-hidden="true"
        >
          {item.category?.icon ?? "🍽️"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isActive ? (
          <FreshnessBadge freshness={item.freshness} daysLeft={item.daysLeft} />
        ) : (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              item.status === "CONSUMED" ? "bg-sky-100 text-sky-800" : "bg-stone-200 text-stone-700"
            }`}
          >
            {item.status === "CONSUMED" ? "Used up" : "Wasted"}
          </span>
        )}
        <span className="text-xs text-stone-500">Exp. {formatDate(item.expirationDate)}</span>
      </div>

      {item.category && <p className="mt-2 text-xs text-stone-500">{item.category.name}</p>}
      {item.notes && <p className="mt-2 line-clamp-2 text-xs italic text-stone-500">“{item.notes}”</p>}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-3">
        {isActive ? (
          <>
            <Button size="sm" variant="secondary" onClick={() => onStatus(item, "CONSUMED")} aria-label={`Mark ${item.name} as used`}>
              ✓ Used
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onStatus(item, "WASTED")} aria-label={`Mark ${item.name} as wasted`}>
              🗑 Wasted
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onAddToList(item)} aria-label={`Add ${item.name} to a shopping list`}>
              🛒
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}>
              ✏️
            </Button>
          </>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => onStatus(item, "ACTIVE")}>
            ↩ Restore
          </Button>
        )}
        <Button size="sm" variant="ghost" className="ml-auto text-red-600 hover:bg-red-50" onClick={() => onDelete(item)} aria-label={`Delete ${item.name}`}>
          Delete
        </Button>
      </div>
    </article>
  )
}
