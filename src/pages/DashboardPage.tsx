import { useAppSelector } from "../store/hooks"

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user)

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900">Welcome, {user?.name}</h1>
      <p className="mt-2 text-stone-600">Your dashboard will appear here in a later phase.</p>
    </div>
  )
}