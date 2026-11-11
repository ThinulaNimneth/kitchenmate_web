import { useEffect, useState } from "react"
import AddToListModal from "../components/pantry/AddToListModal"
import PantryItemCard from "../components/pantry/PantryItemCard"
import PantryItemForm from "../components/pantry/PantryItemForm"
import Button from "../components/ui/Button"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import EmptyState from "../components/ui/EmptyState"
import PageHeader from "../components/ui/PageHeader"
import { PageSpinner } from "../components/ui/Spinner"
import { useDebounce } from "../hooks/useDebounce"
import { useToast } from "../hooks/useToast"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import {
  createPantryItem,
  deletePantryItem,
  fetchPantryItems,
  resetFilters,
  setFilters,
  setPantryItemStatus,
  updatePantryItem
} from "../store/slices/pantrySlice"
import type { Freshness, ItemStatus, PantryFilters, PantryItem, PantryItemInput } from "../types"
import { getErrorMessage } from "../utils/errors"

const FRESHNESS_CHIPS: { value: "" | Freshness; label: string; style: string }[] = [
  { value: "", label: "All", style: "bg-stone-800 text-white" },
  { value: "fresh", label: "🟢 Fresh", style: "bg-emerald-600 text-white" },
  { value: "expiring", label: "🟡 Expiring soon", style: "bg-amber-500 text-white" },
  { value: "expired", label: "🔴 Expired", style: "bg-red-600 text-white" }
]

const STATUS_TABS: { value: ItemStatus; label: string }[] = [
  { value: "ACTIVE", label: "In pantry" },
  { value: "CONSUMED", label: "Used up" },
  { value: "WASTED", label: "Wasted" }
]

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "expirationDate:asc", label: "Expiry: soonest first" },
  { value: "expirationDate:desc", label: "Expiry: latest first" },
  { value: "name:asc", label: "Name: A to Z" },
  { value: "createdAt:desc", label: "Recently added" }
]

export default function PantryPage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { items, meta, filters, loading, error } = useAppSelector((s) => s.pantry)
  const categories = useAppSelector((s) => s.categories.items)

  const [searchText, setSearchText] = useState(filters.search)
  const debouncedSearch = useDebounce(searchText, 400)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PantryItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<PantryItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toList, setToList] = useState<PantryItem | null>(null)


  useEffect(() => {
    if (debouncedSearch !== filters.search) dispatch(setFilters({ search: debouncedSearch }))
  }, [debouncedSearch, filters.search, dispatch])

  //filter change reload
  useEffect(() => {
    void dispatch(fetchPantryItems(filters))
  }, [dispatch, filters])

  const reload = () => dispatch(fetchPantryItems(filters))


  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }


  const openEdit = (item: PantryItem) => {
    setEditing(item)
    setFormOpen(true)
  }


  const handleSubmit = async (values: PantryItemInput) => {
    setSaving(true)
    try {
      if (editing) {
        await dispatch(updatePantryItem({ id: editing._id, body: values })).unwrap()
        toast.success("Item updated")
      } else {
        await dispatch(createPantryItem(values)).unwrap()
        toast.success("Item added to your pantry")
      }
      setFormOpen(false)
      void reload()
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }



  const handleStatus = async (item: PantryItem, status: ItemStatus) => {
    try {
      await dispatch(setPantryItemStatus({ id: item._id, status })).unwrap()
      if (status === "CONSUMED") toast.success(`${item.name} marked as used - no waste!`)
      else if (status === "WASTED") toast.info(`${item.name} marked as wasted`)
      else toast.success(`${item.name} restored to your pantry`)
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    }
  }



  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await dispatch(deletePantryItem(toDelete._id)).unwrap()
      toast.success(`${toDelete.name} deleted`)
      setToDelete(null)
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }



  const changeSort = (value: string) => {
    const [sortBy, order] = value.split(":") as [PantryFilters["sortBy"], PantryFilters["order"]]
    dispatch(setFilters({ sortBy, order }))
  }




  const hasActiveFilters = Boolean(filters.search || filters.category || filters.freshness)


  return (
    <div>
      <PageHeader
        title="My Pantry"
        subtitle="Everything you own, sorted by what needs eating first."
        actions={<Button onClick={openAdd}>＋ Add item</Button>}
      />

      {/* status*/}
      <div className="mb-4 inline-flex rounded-xl bg-stone-200/70 p-1" role="tablist" aria-label="Item status">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={filters.status === tab.value}
            onClick={() => dispatch(setFilters({ status: tab.value, freshness: "" }))}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              filters.status === tab.value ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* fiter */}
      <div className="mb-6 space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="pantry-search" className="sr-only">
              Search items
            </label>
            <input
              id="pantry-search"
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="🔍 Search by name..."
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div>
            <label htmlFor="pantry-category" className="sr-only">
              Filter by category
            </label>
            <select
              id="pantry-category"
              value={filters.category}
              onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pantry-sort" className="sr-only">
              Sort items
            </label>
            <select
              id="pantry-sort"
              value={`${filters.sortBy}:${filters.order}`}
              onChange={(e) => changeSort(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>


        {filters.status === "ACTIVE" && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by freshness">
            {FRESHNESS_CHIPS.map((chip) => (
              <button
                key={chip.value || "all"}
                type="button"
                aria-pressed={filters.freshness === chip.value}
                onClick={() => dispatch(setFilters({ freshness: chip.value }))}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  filters.freshness === chip.value ? chip.style : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {chip.label}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchText("")
                  dispatch(resetFilters())
                }}
                className="ml-auto text-xs font-semibold text-stone-500 underline hover:text-stone-800"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* result */}
      {loading && items.length === 0 ? (
        <PageSpinner label="Loading your pantry..." />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? "🔍" : "🧺"}
          title={hasActiveFilters ? "No items match your filters" : "Nothing here yet"}
          description={
            hasActiveFilters
              ? "Try a different search or clear the filters."
              : filters.status === "ACTIVE"
                ? "Add the groceries you have at home to start tracking their expiry dates."
                : "Items you mark here will show up in this list."
          }
          action={filters.status === "ACTIVE" && !hasActiveFilters ? <Button onClick={openAdd}>＋ Add your first item</Button> : undefined}
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-stone-500" aria-live="polite">
            {meta.total} item{meta.total === 1 ? "" : "s"}
          </p>
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
            {items.map((item) => (
              <PantryItemCard
                key={item._id}
                item={item}
                onEdit={openEdit}
                onDelete={setToDelete}
                onStatus={handleStatus}
                onAddToList={setToList}
              />
            ))}
          </div>

          {meta.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Pagination">
              <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => dispatch(setFilters({ page: meta.page - 1 }))}>
                ← Previous
              </Button>
              <span className="text-sm text-stone-600">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={meta.page >= meta.totalPages}
                onClick={() => dispatch(setFilters({ page: meta.page + 1 }))}
              >
                Next →
              </Button>
            </nav>
          )}
        </>
      )}

      <PantryItemForm open={formOpen} item={editing} submitting={saving} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} />

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete item?"
        message={`“${toDelete?.name ?? ""}” will be permanently removed from your pantry.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />

      <AddToListModal item={toList} onClose={() => setToList(null)} />
    </div>
  )
}
