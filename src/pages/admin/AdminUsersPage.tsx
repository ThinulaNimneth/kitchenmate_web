import { useEffect, useState } from "react"
import Button from "../../components/ui/Button"
import ConfirmDialog from "../../components/ui/ConfirmDialog"
import EmptyState from "../../components/ui/EmptyState"
import PageHeader from "../../components/ui/PageHeader"
import { PageSpinner } from "../../components/ui/Spinner"
import { useDebounce } from "../../hooks/useDebounce"
import { useToast } from "../../hooks/useToast"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { deleteUser, fetchUsers, updateUser } from "../../store/slices/adminSlice"
import type { AdminUser } from "../../types"
import { formatDate } from "../../utils/date"
import { getErrorMessage } from "../../utils/errors"

export default function AdminUsersPage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { users, meta, loading, error } = useAppSelector((s) => s.admin)
  const me = useAppSelector((s) => s.auth.user)

  const [search, setSearch] = useState("")
  const debounced = useDebounce(search, 400)
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    void dispatch(fetchUsers({ search: debounced || undefined, page }))
  }, [dispatch, debounced, page])

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action()
      toast.success(message)
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    }
  }



  const toggleAdmin = (u: AdminUser) => {
    const isAdmin = u.roles.includes("ADMIN")
    const roles = isAdmin ? ["USER"] : ["ADMIN", "USER"]
    return run(() => dispatch(updateUser({ id: u.id, body: { roles } })).unwrap(), isAdmin ? `${u.name} is now a regular user` : `${u.name} is now an admin`)
  }



  const toggleActive = (u: AdminUser) =>
    run(() => dispatch(updateUser({ id: u.id, body: { isActive: !u.isActive } })).unwrap(), u.isActive ? `${u.name} deactivated` : `${u.name} re-activated`)

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    await run(() => dispatch(deleteUser(toDelete.id)).unwrap(), "User and their data deleted")
    setDeleting(false)
    setToDelete(null)
  }



  return (
    <div>
      <PageHeader title="Manage Users" subtitle="Administrator tools: roles, access and account removal." />

      <div className="mb-4">
        <label htmlFor="user-search" className="sr-only">
          Search users
        </label>
        <input
          id="user-search"
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="🔍 Search by name or email..."
          className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:max-w-sm"
        />
      </div>

      {loading && users.length === 0 ? (
        <PageSpinner />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No users found" />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th scope="col" className="px-4 py-3">User</th>
                  <th scope="col" className="px-4 py-3">Role</th>
                  <th scope="col" className="px-4 py-3">Items</th>
                  <th scope="col" className="px-4 py-3">Joined</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => {
                  const self = u.id === me?.id
                  const isAdmin = u.roles.includes("ADMIN")
                  return (
                    <tr key={u.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-stone-900">
                          {u.name} {self && <span className="text-xs font-normal text-stone-400">(you)</span>}
                        </p>
                        <p className="text-xs text-stone-500">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isAdmin ? "bg-violet-100 text-violet-800" : "bg-stone-100 text-stone-700"}`}>
                          {isAdmin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{u.pantryItemCount}</td>
                      <td className="px-4 py-3 text-stone-600">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                          {u.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" disabled={self} onClick={() => toggleAdmin(u)}>
                            {isAdmin ? "Make user" : "Make admin"}
                          </Button>
                          <Button size="sm" variant="ghost" disabled={self} onClick={() => toggleActive(u)}>
                            {u.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" disabled={self || isAdmin} onClick={() => setToDelete(u)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {meta.totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Pagination">
              <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)}>
                ← Previous
              </Button>
              <span className="text-sm text-stone-600">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button variant="secondary" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage(meta.page + 1)}>
                Next →
              </Button>
            </nav>
          )}
        </>
      )}

      

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete user?"
        message={`“${toDelete?.name ?? ""}” and ALL of their pantry items, lists and recipes will be permanently deleted.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
