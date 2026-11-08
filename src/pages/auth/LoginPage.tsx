import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Button from "../../components/ui/Button"
import { Input } from "../../components/ui/Field"
import { useToast } from "../../hooks/useToast"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { clearAuthError, login } from "../../store/slices/authSlice"
import AuthShell from "./AuthShell"

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { loading, error } = useAppSelector((s) => s.auth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const found: typeof errors = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) found.email = "Enter a valid email address"
    if (!password) found.password = "Password is required"
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const result = await dispatch(login({ email: email.trim(), password }))
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.name}!`)
      const from = (location.state as { from?: string } | null)?.from ?? "/"
      navigate(from, { replace: true })
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to see what is in your pantry today.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Button type="submit" loading={loading} className="w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        New to PantryPal?{" "}
        <Link to="/register" className="font-semibold text-emerald-700 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-2xl bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
        <p className="font-semibold">Demo account</p>
        <p className="mt-0.5">
          demo@pantrypal.com / Demo@12345
        </p>
      </div>
    </AuthShell>
  )
}
