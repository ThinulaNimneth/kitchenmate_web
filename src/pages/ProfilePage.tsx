import { useState } from "react"
import type { FormEvent } from "react"
import Button from "../components/ui/Button"
import { Input } from "../components/ui/Field"
import PageHeader from "../components/ui/PageHeader"
import { useToast } from "../hooks/useToast"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { changePassword, updateProfile } from "../store/slices/authSlice"
import { formatDate } from "../utils/date"



export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const user = useAppSelector((s) => s.auth.user)

  const [name, setName] = useState(user?.name ?? "")
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | undefined>()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [savingPw, setSavingPw] = useState(false)
  const [pwErrors, setPwErrors] = useState<Partial<Record<"current" | "next" | "confirm", string>>>({})

  if (!user) return null

  const handleName = async (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters")
      return
    }
    setNameError(undefined)
    setSavingName(true)
    const result = await dispatch(updateProfile({ name: name.trim() }))
    setSavingName(false)
    if (updateProfile.fulfilled.match(result)) toast.success("Profile updated")
    else toast.error(result.payload ?? "Could not update profile")
  }

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault()
    const found: typeof pwErrors = {}
    if (!currentPassword) found.current = "Enter your current password"
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      found.next = "At least 8 characters with a letter and a number"
    }
    if (confirm !== newPassword) found.confirm = "Passwords do not match"
    setPwErrors(found)
    if (Object.keys(found).length > 0) return

    setSavingPw(true)
    const result = await dispatch(changePassword({ currentPassword, newPassword }))
    setSavingPw(false)
    if (changePassword.fulfilled.match(result)) {
      toast.success("Password changed")
      setCurrentPassword("")
      setNewPassword("")
      setConfirm("")
    } else {
      toast.error(result.payload ?? "Could not change password")
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" subtitle="Manage your account details." />

      <section className="mb-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-800">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-bold text-stone-900">{user.email}</p>
            <p className="text-sm text-stone-500">
              {user.roles.join(" · ")} · member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>
        <form onSubmit={handleName} className="space-y-4" noValidate>
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} error={nameError} />
          <Button type="submit" loading={savingName}>
            Save name
          </Button>
        </form>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-stone-900">Change password</h2>
        <form onSubmit={handlePassword} className="space-y-4" noValidate>
          <Input label="Current password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} error={pwErrors.current} />
          <Input label="New password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} error={pwErrors.next} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={pwErrors.confirm} />
          <Button type="submit" loading={savingPw}>
            Update password
          </Button>
        </form>
      </section>
    </div>
  )
}
