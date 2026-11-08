import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAppSelector } from "../../store/hooks"
import type { UserRole } from "../../types"



//only log in
export function ProtectedRoute() {
    const user = useAppSelector( (s) => s.auth.user)
    const location = useLocation()
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
    return <Outlet/>
}


//role access
export function RoleRoute({ roles }: { roles: UserRole[] }) {
  const user = useAppSelector((s) => s.auth.user)
  const allowed = user?.roles.some((r) => roles.includes(r)) ?? false
  if (!allowed) return <Navigate to="/" replace />
  return <Outlet />
}


//redirect
export function GuestRoute() {
    const user = useAppSelector((s) => s.auth.user)
    if (user) return  <Navigate to="/" replace />
    return <Outlet/>
}
