import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import Button from "../components/ui/Button"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import EmptyState from "../components/ui/EmptyState"
import { Input } from "../components/ui/Field"
import Modal from "../components/ui/Modal"
import PageHeader from "../components/ui/PageHeader"
import { PageSpinner } from "../components/ui/Spinner"
import { useToast } from "../hooks/useToast"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { createList, deleteList, fetchLists, updateList } from "../store/slices/shoppingSlice"
import type { ShoppingList } from "../types"
import { getErrorMessage } from "../utils/errors"

function NewListForm({ submitting, onSubmit, onClose }: { submitting: boolean; onSubmit: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState("")
  const [error, setError] = useState<string | undefined>()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError("List name must be at least 2 characters")
      return
    }
    onSubmit(name.trim())
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input label="List name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekend BBQ" error={error} autoFocus />
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Create list
        </Button>
      </div>
    </form>
  )
}



export default function ShoppingListsPage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { lists, loading, error } = useAppSelector((s) => s.shopping)

  const [archived, setArchived] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<ShoppingList | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    void dispatch(fetchLists(archived))
  }, [dispatch, archived])

  const handleCreate = async (name: string) => {
    setSaving(true)
    try {
      await dispatch(createList(name)).unwrap()
      toast.success("Shopping list created")
      setFormOpen(false)
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async (list: ShoppingList) => {
    try {
      await dispatch(updateList({ id: list._id, body: { isArchived: !list.isArchived } })).unwrap()
      //list mved
      void dispatch(fetchLists(archived))
      toast.success(list.isArchived ? "List restored" : "List archived")
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await dispatch(deleteList(toDelete._id)).unwrap()
      toast.success("Shopping list deleted")
      setToDelete(null)
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Shopping Lists"
        subtitle="Plan what to buy - then move it straight into your pantry."
        actions={<Button onClick={() => setFormOpen(true)}>＋ New list</Button>}
      />

      <div className="mb-5 inline-flex rounded-xl bg-stone-200/70 p-1" role="tablist" aria-label="List status">
        {[
          { value: false, label: "Active" },
          { value: true, label: "Archived" }
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={archived === tab.value}
            onClick={() => setArchived(tab.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              archived === tab.value ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && lists.length === 0 ? (
        <PageSpinner />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : lists.length === 0 ? (
        <EmptyState
          icon="🛒"
          title={archived ? "No archived lists" : "No shopping lists yet"}
          description={archived ? "Lists you archive will appear here." : "Create a list and add the groceries you need."}
          action={!archived ? <Button onClick={() => setFormOpen(true)}>＋ Create your first list</Button> : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => {
            const done = list.items.filter((i) => i.checked).length
            const total = list.items.length
            const pct = total === 0 ? 0 : Math.round((done / total) * 100)
            return (
              <article key={list._id} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <Link to={`/shopping/${list._id}`} className="group flex-1">
                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700">🛒 {list.name}</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {total === 0 ? "No items yet" : `${done} of ${total} items ticked`}
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </Link>
                <div className="mt-4 flex gap-2 border-t border-stone-100 pt-3">
                  <Link to={`/shopping/${list._id}`} className="flex-1">
                    <Button size="sm" variant="secondary" className="w-full">
                      Open
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => handleArchive(list)}>
                    {list.isArchived ? "Restore" : "Archive"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" aria-label={`Delete ${list.name}`} onClick={() => setToDelete(list)}>
                    🗑
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="New shopping list">
        <NewListForm submitting={saving} onSubmit={handleCreate} onClose={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete shopping list?"
        message={`“${toDelete?.name ?? ""}” and all of its items will be permanently deleted.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
