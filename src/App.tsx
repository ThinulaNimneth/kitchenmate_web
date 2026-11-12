import { useEffect } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import AppLayout from "./components/layout/AppLayout"
import { GuestRoute, ProtectedRoute, RoleRoute } from "./components/layout/RouteGuards"
import { PageSpinner } from "./components/ui/Spinner"
import Toaster from "./components/ui/Toaster"
import AdminUsersPage from "./pages/admin/AdminUsersPage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import CategoriesPage from "./pages/CategoriesPage"
import DashboardPage from "./pages/DashboardPage"
import PantryPage from "./pages/PantryPage"
import ProfilePage from "./pages/ProfilePage"
import RecipesPage from "./pages/RecipesPage"
import ShoppingListDetailPage from "./pages/ShoppingListDetailPage"
import ShoppingListsPage from "./pages/ShoppingListsPage"
import { useAppDispatch, useAppSelector } from "./store/hooks"
import { fetchMe } from "./store/slices/authSlice"

export default function App() {
  const dispatch = useAppDispatch()
  const initializing = useAppSelector((s) => s.auth.initializing)

  // revalidate token and reload user on page refresh
  useEffect(() => {
    if (initializing) void dispatch(fetchMe())
  }, [dispatch, initializing])

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageSpinner label="Starting KitchenMate..." />
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="pantry" element={<PantryPage />} />
            <Route path="shopping" element={<ShoppingListsPage />} />
            <Route path="shopping/:id" element={<ShoppingListDetailPage />} />
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="profile" element={<ProfilePage />} />

            <Route element={<RoleRoute roles={["ADMIN"]} />}>
              <Route path="admin/users" element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}