import { useEffect, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { logout } from "../../store/slices/authSlice"
import Button from "../ui/Button"

interface NavItem {
  to: string
  label: string
  icon: string
  adminOnly?: boolean
  end?: boolean
}

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  
]

export default function AppLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((s) => s.auth.user)
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = user?.roles.includes("ADMIN") ?? false



  
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await dispatch(logout())
    navigate("/login", { replace: true })
  }

  const links = NAV.filter((item) => !item.adminOnly || isAdmin)

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl shadow-sm" aria-hidden="true">
          🥕
        </span>
        <div>
          <p className="text-lg font-extrabold leading-none tracking-tight text-stone-900">PantryPal</p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-emerald-700">Waste less. Eat better.</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Main navigation">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isActive ? "bg-emerald-50 text-emerald-800" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-stone-200 p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
            {user?.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-800">{user?.name}</p>
            <p className="truncate text-xs text-stone-500">{isAdmin ? "Administrator" : user?.email}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="w-full" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen md:flex">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-stone-200 bg-white md:block">
        {sidebar}
      </aside>

      {/* mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600" aria-hidden="true">
            🥕
          </span>
          <span className="font-extrabold text-stone-900">PantryPal</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-xl text-stone-700 hover:bg-stone-100"
        >
          ☰
        </button>
      </header>

      {/* mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-stone-900/50" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
