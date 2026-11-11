import { useState } from "react"
import type { FormEvent } from "react"
import Button from "../components/ui/Button"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import EmptyState from "../components/ui/EmptyState"
import { Input } from "../components/ui/Field"
import Modal from "../components/ui/Modal"
import PageHeader from "../components/ui/PageHeader"
import { PageSpinner } from "../components/ui/Spinner"
import { useToast } from "../hooks/useToast"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { createCategory, deleteCategory, updateCategory } from "../store/slices/categorySlice"
import type { Category } from "../types"
import { getErrorMessage } from "../utils/errors"



interface CategoryFormValues {
  name: string
  icon: string
  color: string
  isGlobal: boolean
}



interface CategoryFormProps {
  category: Category | null
  isAdmin: boolean
  submitting: boolean
  onSubmit: (values: CategoryFormValues) => void
  onClose: () => void
}



function CategoryForm({ category, isAdmin, submitting, onSubmit, onClose }: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "")
  const [icon, setIcon] = useState(category?.icon ?? "🍽️")
  const [color, setColor] = useState(category?.color ?? "#16a34a")
  const [isGlobal, setIsGlobal] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters")
      return
    }
    setError(undefined)
    onSubmit({ name: name.trim(), icon: icon.trim() || "🍽️", color, isGlobal })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input label="Category name" value={name} onChange={(e) => setName(e.target.value)} error={error} autoFocus />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Emoji icon" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={8} />
        <div>
          <label htmlFor="cat-color" className="mb-1.5 block text-sm font-medium text-stone-700">
            Colour
          </label>
          <input
            id="cat-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-[42px] w-full cursor-pointer rounded-xl border border-stone-300 bg-white p-1"
          />
        </div>
      </div>
      {isAdmin && !category && (
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
          Make this a <strong>global</strong> category (visible to all users)
        </label>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {category ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  )
}



export default function CategoriesPage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { items, loading } = useAppSelector((s) => s.categories)
  const user = useAppSelector((s) => s.auth.user)
  const isAdmin = user?.roles.includes("ADMIN") ?? false

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const canModify = (c: Category) => (c.owner === null ? isAdmin : true)

  const handleSubmit = async (values: CategoryFormValues) => {
    setSaving(true)
    try {
      if (editing) {
        await dispatch(updateCategory({ id: editing._id, body: { name: values.name, icon: values.icon, color: values.color } })).unwrap()
        toast.success("Category updated")
      } else {
        await dispatch(createCategory(values)).unwrap()
        toast.success("Category created")
      }
      setFormOpen(false)
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    try {
      await dispatch(deleteCategory(toDelete._id)).unwrap()
      toast.success("Category deleted")
      setToDelete(null)
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const mine = items.filter((c) => c.owner !== null)
  const global = items.filter((c) => c.owner === null)

  const renderCard = (c: Category) => (
    <article key={c._id} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
        style={{ backgroundColor: `${c.color}22` }}
        aria-hidden="true"
      >
        {c.icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold text-stone-900">{c.name}</h3>
        <p className="text-xs text-stone-500">
          {c.itemCount ?? 0} item{c.itemCount === 1 ? "" : "s"} in your pantry
        </p>
      </div>
      {canModify(c) && (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Edit ${c.name}`}
            onClick={() => {
              setEditing(c)
              setFormOpen(true)
            }}
          >
            ✏️
          </Button>
          <Button size="sm" variant="ghost" aria-label={`Delete ${c.name}`} onClick={() => setToDelete(c)}>
            🗑
          </Button>
        </div>
      )}
    </article>
  )

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Organise your pantry. Create your own, or use the shared ones."
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            ＋ New category
          </Button>
        }
      />

      {loading && items.length === 0 ? (
        <PageSpinner />
      ) : items.length === 0 ? (
        <EmptyState icon="🏷️" title="No categories yet" description="Create your first category to start organising items." />
      ) : (
        <div className="space-y-8">
          <section aria-labelledby="mine-title">
            <h2 id="mine-title" className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-500">
              My categories
            </h2>
            {mine.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-6 text-center text-sm text-stone-500">
                You have not created any personal categories yet.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{mine.map(renderCard)}</div>
            )}
          </section>
          <section aria-labelledby="global-title">
            <h2 id="global-title" className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-500">
              Shared categories {isAdmin ? "(you can manage these)" : ""}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{global.map(renderCard)}</div>
          </section>
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit category" : "New category"}>
        <CategoryForm category={editing} isAdmin={isAdmin} submitting={saving} onSubmit={handleSubmit} onClose={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete category?"
        message={`“${toDelete?.name ?? ""}” will be removed. Categories that still contain items cannot be deleted.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
