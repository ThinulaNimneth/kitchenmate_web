import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import Button from "../components/ui/Button"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import EmptyState from "../components/ui/EmptyState"
import { Input, Select } from "../components/ui/Field"
import Modal from "../components/ui/Modal"
import { PageSpinner } from "../components/ui/Spinner"
import { useToast } from "../hooks/useToast"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import {
  addListItem,
  clearCheckedItems,
  deleteList,
  fetchList,
  moveToPantry,
  removeListItem,
  updateList,
  updateListItem
} from "../store/slices/shoppingSlice"
import type { ShoppingItem } from "../types"
import { UNITS } from "../utils/constants"
import { todayPlus } from "../utils/date"
import { getErrorMessage } from "../utils/errors"

interface MoveRow {
  category: string
  expirationDate: string
}

interface MoveFormProps {
  items: ShoppingItem[]
  submitting: boolean
  onSubmit: (rows: { itemId: string; category: string; expirationDate: string }[]) => void
  onClose: () => void
}

//category and ex date choose and move to pantry
function MoveForm({ items, submitting, onSubmit, onClose }: MoveFormProps) {
  const categories = useAppSelector((s) => s.categories.items)
  const fallbackCategory = categories.find((c) => c.name === "Other")?._id ?? categories[0]?._id ?? ""

  const [rows, setRows] = useState<Record<string, MoveRow>>(() =>
    Object.fromEntries(
      items.map((i) => [i._id, { category: i.category ?? fallbackCategory, expirationDate: todayPlus(7) }])
    )
  )

  const patch = (id: string, change: Partial<MoveRow>) =>
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...change } }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(items.map((i) => ({ itemId: i._id, ...rows[i._id] })))
  }

  const valid = items.every((i) => rows[i._id]?.category && rows[i._id]?.expirationDate)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-stone-600">Choose a category and an expiry date for each item you bought.</p>
      <div className="space-y-4">
        {items.map((item) => (
          <fieldset key={item._id} className="rounded-2xl border border-stone-200 p-4">
            <legend className="px-1 text-sm font-bold text-stone-800">
              {item.name} <span className="font-normal text-stone-500">({item.quantity} {item.unit})</span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Category" value={rows[item._id]?.category ?? ""} onChange={(e) => patch(item._id, { category: e.target.value })}>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Expires on"
                type="date"
                value={rows[item._id]?.expirationDate ?? ""}
                onChange={(e) => patch(item._id, { expirationDate: e.target.value })}
              />
            </div>
          </fieldset>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={!valid}>
          Move to pantry
        </Button>
      </div>
    </form>
  )
}

export default function ShoppingListDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { current: list, loading, error } = useAppSelector((s) => s.shopping)

  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [unit, setUnit] = useState("pcs")
  const [adding, setAdding] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [moving, setMoving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (id) void dispatch(fetchList(id))
  }, [dispatch, id])

  if (loading && !list) return <PageSpinner label="Loading list..." />
  if (!list || list._id !== id) {
    return (
      <EmptyState
        icon="🤷"
        title={error ?? "List not found"}
        action={
          <Link to="/shopping">
            <Button variant="secondary">← Back to lists</Button>
          </Link>
        }
      />
    )
  }

  const checked = list.items.filter((i) => i.checked)
  const unchecked = list.items.filter((i) => !i.checked)

  const run = async (action: () => Promise<unknown>, successMessage?: string) => {
    try {
      await action()
      if (successMessage) toast.success(successMessage)
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    }
  }

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setAdding(true)
    await run(async () => {
      await dispatch(addListItem({ id: list._id, body: { name: name.trim(), quantity: Number(quantity) || 1, unit } })).unwrap()
      setName("")
      setQuantity("1")
    })
    setAdding(false)
  }

  const handleMove = async (rows: { itemId: string; category: string; expirationDate: string }[]) => {
    setMoving(true)
    await run(async () => {
      const result = await dispatch(moveToPantry({ id: list._id, items: rows })).unwrap()
      toast.success(`${result.moved} item(s) added to your pantry 🎉`)
      setMoveOpen(false)
    })
    setMoving(false)
  }

  const handleDeleteList = async () => {
    setDeleting(true)
    try {
      await dispatch(deleteList(list._id)).unwrap()
      toast.success("Shopping list deleted")
      navigate("/shopping", { replace: true })
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
      setDeleting(false)
    }
  }

  const renderItem = (item: ShoppingItem) => (
    <li key={item._id} className="flex items-center gap-3 px-4 py-3">
      <input
        id={`item-${item._id}`}
        type="checkbox"
        checked={item.checked}
        onChange={() => run(() => dispatch(updateListItem({ id: list._id, itemId: item._id, body: { checked: !item.checked } })).unwrap())}
        className="h-5 w-5 shrink-0 cursor-pointer accent-emerald-600"
      />
      <label htmlFor={`item-${item._id}`} className={`flex-1 cursor-pointer ${item.checked ? "text-stone-400 line-through" : "text-stone-800"}`}>
        <span className="font-medium">{item.name}</span>
        <span className="ml-2 text-sm text-stone-500">
          {item.quantity} {item.unit}
        </span>
      </label>
      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        onClick={() => run(() => dispatch(removeListItem({ id: list._id, itemId: item._id })).unwrap())}
        className="rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
      >
        ✕
      </button>
    </li>
  )

  return (
    <div>
      <Link to="/shopping" className="text-sm font-semibold text-emerald-700 hover:underline">
        ← All lists
      </Link>

      <div className="mb-6 mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">🛒 {list.name}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {checked.length} of {list.items.length} ticked
            {list.isArchived && " · archived"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => run(() => dispatch(updateList({ id: list._id, body: { isArchived: !list.isArchived } })).unwrap(), list.isArchived ? "List restored" : "List archived")}>
            {list.isArchived ? "Restore" : "Archive"}
          </Button>
          <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setConfirmDelete(true)}>
            Delete list
          </Button>
        </div>
      </div>

      {/* add item */}
      <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_6rem_7rem_auto] sm:items-end">
        <Input label="Item" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Butter" maxLength={100} />
        <Input label="Qty" type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <Select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Select>
        <Button type="submit" loading={adding} disabled={!name.trim()}>
          Add
        </Button>
      </form>

      {list.items.length === 0 ? (
        <EmptyState icon="📝" title="This list is empty" description="Add the first thing you need to buy above." />
      ) : (
        <div className="space-y-6">
          {unchecked.length > 0 && (
            <section aria-label="To buy">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">To buy ({unchecked.length})</h2>
              <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                {unchecked.map(renderItem)}
              </ul>
            </section>
          )}

          {checked.length > 0 && (
            <section aria-label="In the basket">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">In the basket ({checked.length})</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => run(() => dispatch(clearCheckedItems(list._id)).unwrap(), "Ticked items cleared")}>
                    Clear ticked
                  </Button>
                  <Button size="sm" onClick={() => setMoveOpen(true)}>
                    📦 Move to pantry
                  </Button>
                </div>
              </div>
              <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                {checked.map(renderItem)}
              </ul>
            </section>
          )}
        </div>
      )}

      <Modal open={moveOpen} onClose={() => setMoveOpen(false)} title="Move bought items to your pantry" size="lg">
        <MoveForm items={checked} submitting={moving} onSubmit={handleMove} onClose={() => setMoveOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete shopping list?"
        message={`“${list.name}” and all of its items will be permanently deleted.`}
        loading={deleting}
        onConfirm={handleDeleteList}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
