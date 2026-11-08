import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import Button from "../../components/ui/Button"
import { Input } from "../../components/ui/Field"
import { useToast } from "../../hooks/useToast"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { clearAuthError, register } from "../../store/slices/authSlice"
import AuthShell from "./AuthShell"

type Errors = Partial<Record<"name" | "email" | "password" | "confirm", string>>

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { loading, error } = useAppSelector((s) => s.auth)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const found: Errors = {}
    if (name.trim().length < 2) found.name = "Name must be at least 2 characters"
    if (!/^\S+@\S+\.\S+$/.test(email)) found.email = "Enter a valid email address"
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      found.password = "At least 8 characters with a letter and a number"
    }
    if (confirm !== password) found.confirm = "Passwords do not match"
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const result = await dispatch(register({ name: name.trim(), email: email.trim(), password }))
    if (register.fulfilled.match(result)) {
      toast.success("Account created - welcome to PantryPal!")
      navigate("/", { replace: true })
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Start tracking your pantry in under a minute.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <Input label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="Minimum 8 characters, include a letter and a number"
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />
        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
