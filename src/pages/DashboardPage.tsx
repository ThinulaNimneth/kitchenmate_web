import { useEffect } from "react"
import { Link } from "react-router-dom"
import FreshnessBadge from "../components/ui/FreshnessBadge"
import PageHeader from "../components/ui/PageHeader"
import { PageSpinner } from "../components/ui/Spinner"
import Button from "../components/ui/Button"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { fetchDashboardStats } from "../store/slices/dashboardSlice"

interface StatTileProps {
  label: string
  value: number
  icon: string
  tone: string
  to: string
}



function StatTile({ label, value, icon, tone, to }: StatTileProps) {
  return (
    <Link
      to={to}
      className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tone}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl" aria-hidden="true">
          {icon}
        </span>
        <span className="text-3xl font-extrabold">{value}</span>
      </div>
      <p className="mt-2 text-sm font-semibold">{label}</p>
    </Link>
  )
}



export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const { stats, loading, error } = useAppSelector((s) => s.dashboard)

  useEffect(() => {
    void dispatch(fetchDashboardStats())
  }, [dispatch])

  if (loading && !stats) return <PageSpinner label="Loading your dashboard..." />
  if (error && !stats) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}{" "}
        <button type="button" className="font-semibold underline" onClick={() => void dispatch(fetchDashboardStats())}>
          Retry
        </button>
      </div>
    )
  }
  if (!stats) return null

  const { totals, monthly, byCategory, wasteSummary, expiringSoon } = stats
  const maxMonthly = Math.max(1, ...monthly.map((m) => m.consumed + m.wasted))
  const maxCategory = Math.max(1, ...byCategory.map((c) => c.count))

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name.split(" ")[0] ?? "there"} 👋`}
        subtitle="Here is what is happening in your kitchen."
        actions={
          <Link to="/recipes">
            <Button>🍳 Cook with expiring items</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Items in pantry" value={totals.active} icon="🥫" tone="border-stone-200 bg-white text-stone-800" to="/pantry" />
        <StatTile label="Fresh" value={totals.fresh} icon="🟢" tone="border-emerald-200 bg-emerald-50 text-emerald-800" to="/pantry" />
        <StatTile label="Expiring soon" value={totals.expiring} icon="🟡" tone="border-amber-200 bg-amber-50 text-amber-800" to="/pantry" />
        <StatTile label="Expired" value={totals.expired} icon="🔴" tone="border-red-200 bg-red-50 text-red-800" to="/pantry" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Use these first */}
        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-3" aria-labelledby="use-first">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="use-first" className="text-lg font-bold text-stone-900">
              Use these first
            </h2>
            <Link to="/pantry" className="text-sm font-semibold text-emerald-700 hover:underline">
              View pantry →
            </Link>
          </div>
          {expiringSoon.length === 0 ? (
            <p className="rounded-2xl bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-800">
              🎉 Nothing is about to expire.!
            </p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {expiringSoon.map((item) => (
                <li key={item._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xl" aria-hidden="true">
                      {item.category?.icon ?? "🍽️"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-800">{item.name}</p>
                      <p className="text-xs text-stone-500">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                  <FreshnessBadge freshness={item.freshness} daysLeft={item.daysLeft} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Waste summary */}
        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-2" aria-labelledby="waste-title">
          <h2 id="waste-title" className="text-lg font-bold text-stone-900">
            Food waste score
          </h2>
          <p className="text-xs text-stone-500">Last 6 months</p>
          {wasteSummary.savedRate === null ? (
            <p className="mt-6 text-sm text-stone-500">
              Mark items as <strong>Used</strong> or <strong>Wasted</strong> in your pantry to see your score here.
            </p>
          ) : (
            <>
              <p className="mt-4 text-5xl font-extrabold text-emerald-600">{wasteSummary.savedRate}%</p>
              <p className="text-sm text-stone-600">of your food was eaten instead of thrown away</p>
              <div className="mt-4 flex gap-3 text-sm">
                <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">
                  ✓ {wasteSummary.consumed} used
                </span>
                <span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-800">
                  ✕ {wasteSummary.wasted} wasted
                </span>
              </div>
            </>
          )}
          <div className="mt-5 flex gap-3 text-sm">
            <Link to="/shopping" className="flex-1 rounded-xl bg-stone-100 px-3 py-2 text-center font-semibold text-stone-700 hover:bg-stone-200">
              🛒 {stats.openShoppingLists} lists
            </Link>
            <Link to="/recipes" className="flex-1 rounded-xl bg-stone-100 px-3 py-2 text-center font-semibold text-stone-700 hover:bg-stone-200">
              📖 {stats.savedRecipes} recipes
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Monthly chart */}
        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="monthly-title">
          <h2 id="monthly-title" className="text-lg font-bold text-stone-900">
            Used vs wasted
          </h2>
          <div className="mt-4 flex h-44 items-end gap-3" role="img" aria-label="Bar chart of items used and wasted per month">
            {monthly.map((m) => (
              <div key={`${m.year}-${m.month}`} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-36 w-full flex-col justify-end overflow-hidden rounded-lg bg-stone-100">
                  <div className="bg-red-400" style={{ height: `${(m.wasted / maxMonthly) * 100}%` }} title={`${m.wasted} wasted`} />
                  <div className="bg-emerald-500" style={{ height: `${(m.consumed / maxMonthly) * 100}%` }} title={`${m.consumed} used`} />
                </div>
                <span className="text-xs font-medium text-stone-500">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Used
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Wasted
            </span>
          </div>
        </section>

        {/* Category breakdown */}
        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="cat-title">
          <h2 id="cat-title" className="text-lg font-bold text-stone-900">
            Pantry by category
          </h2>
          {byCategory.length === 0 ? (
            <p className="mt-6 text-sm text-stone-500">Your pantry is empty. Add your first item!</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {byCategory.map((c) => (
                <li key={c.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-stone-700">
                      <span aria-hidden="true">{c.icon}</span> {c.name}
                    </span>
                    <span className="text-stone-500">{c.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full" style={{ width: `${(c.count / maxCategory) * 100}%`, backgroundColor: c.color }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
