import type {
  AdminUser,
  ApiResponse,
  AuthPayload,
  Category,
  DashboardStats,
  GenerateRecipeParams,
  PageMeta,
  PantryFilters,
  PantryItem,
  PantryItemInput,
  Recipe,
  RecipeBasis,
  SavedRecipe,
  ShoppingList,
  User
} from "../types"
import { api } from "./client"

// Every function unwraps the { success, message, data } envelope from the API.

// ---------------- AUTH ----------------
export const authApi = {
  login: async (body: { email: string; password: string }) =>
    (await api.post<ApiResponse<AuthPayload>>("/auth/login", body)).data.data,
  register: async (body: { name: string; email: string; password: string }) =>
    (await api.post<ApiResponse<AuthPayload>>("/auth/register", body)).data.data,
  logout: async () => {
    await api.post("/auth/logout")
  },
  me: async () => (await api.get<ApiResponse<User>>("/auth/me")).data.data,
  updateProfile: async (body: { name: string }) =>
    (await api.put<ApiResponse<User>>("/auth/me", body)).data.data,
  changePassword: async (body: { currentPassword: string; newPassword: string }) =>
    (await api.put<ApiResponse<AuthPayload>>("/auth/me/password", body)).data.data
}

// ---------------- CATEGORIES ----------------
export interface CategoryInput {
  name: string
  icon?: string
  color?: string
  isGlobal?: boolean
}

export const categoryApi = {
  list: async () => (await api.get<ApiResponse<Category[]>>("/categories")).data.data,
  create: async (body: CategoryInput) => (await api.post<ApiResponse<Category>>("/categories", body)).data.data,
  update: async (id: string, body: Partial<CategoryInput>) =>
    (await api.put<ApiResponse<Category>>(`/categories/${id}`, body)).data.data,
  remove: async (id: string) => {
    await api.delete(`/categories/${id}`)
  }
}

//pantry
export const pantryApi = {
  list: async (filters: PantryFilters) => {
    //set filters only
    const params: Record<string, string | number> = {
      status: filters.status,
      sortBy: filters.sortBy,
      order: filters.order,
      page: filters.page,
      limit: filters.limit
    }
    if (filters.search) params.search = filters.search
    if (filters.category) params.category = filters.category
    if (filters.freshness) params.freshness = filters.freshness
    const res = await api.get<ApiResponse<PantryItem[]>>("/pantry", { params })
    return { items: res.data.data, meta: res.data.meta as PageMeta }
  },
  expiring: async (days: number) =>
    (await api.get<ApiResponse<PantryItem[]>>("/pantry/expiring", { params: { days } })).data.data,
  create: async (body: PantryItemInput) => (await api.post<ApiResponse<PantryItem>>("/pantry", body)).data.data,
  update: async (id: string, body: Partial<PantryItemInput>) =>
    (await api.put<ApiResponse<PantryItem>>(`/pantry/${id}`, body)).data.data,
  setStatus: async (id: string, status: PantryItem["status"]) =>
    (await api.patch<ApiResponse<PantryItem>>(`/pantry/${id}/status`, { status })).data.data,
  remove: async (id: string) => {
    await api.delete(`/pantry/${id}`)
  }
}




//shopping list
export interface ListItemInput {
  name: string
  quantity: number
  unit: string
}

export interface MoveToPantryEntry {
  itemId: string
  category: string
  expirationDate: string
}

export const shoppingApi = {
  list: async (archived: boolean) =>
    (await api.get<ApiResponse<ShoppingList[]>>("/shopping-lists", { params: { archived } })).data.data,
  get: async (id: string) => (await api.get<ApiResponse<ShoppingList>>(`/shopping-lists/${id}`)).data.data,
  create: async (name: string) =>
    (await api.post<ApiResponse<ShoppingList>>("/shopping-lists", { name })).data.data,
  update: async (id: string, body: { name?: string; isArchived?: boolean }) =>
    (await api.put<ApiResponse<ShoppingList>>(`/shopping-lists/${id}`, body)).data.data,
  remove: async (id: string) => {
    await api.delete(`/shopping-lists/${id}`)
  },
  addItem: async (id: string, body: ListItemInput) =>
    (await api.post<ApiResponse<ShoppingList>>(`/shopping-lists/${id}/items`, body)).data.data,
  updateItem: async (id: string, itemId: string, body: Partial<ListItemInput> & { checked?: boolean }) =>
    (await api.put<ApiResponse<ShoppingList>>(`/shopping-lists/${id}/items/${itemId}`, body)).data.data,
  removeItem: async (id: string, itemId: string) =>
    (await api.delete<ApiResponse<ShoppingList>>(`/shopping-lists/${id}/items/${itemId}`)).data.data,
  clearChecked: async (id: string) =>
    (await api.delete<ApiResponse<ShoppingList>>(`/shopping-lists/${id}/checked`)).data.data,
  moveToPantry: async (id: string, items: MoveToPantryEntry[]) =>
    (await api.post<ApiResponse<{ moved: number; list: ShoppingList }>>(`/shopping-lists/${id}/move-to-pantry`, { items }))
      .data.data
}



//gemini recipies
export const recipeApi = {
  generate: async (body: GenerateRecipeParams) =>
    (await api.post<ApiResponse<{ recipes: Recipe[]; basedOn: RecipeBasis[] }>>("/recipes/generate", body, {
      timeout: 60000
    })).data.data,
  list: async () => (await api.get<ApiResponse<SavedRecipe[]>>("/recipes")).data.data,
  save: async (recipe: Recipe) => (await api.post<ApiResponse<SavedRecipe>>("/recipes", recipe)).data.data,
  remove: async (id: string) => {
    await api.delete(`/recipes/${id}`)
  }
}



//dashboard
export const dashboardApi = {
  stats: async () => (await api.get<ApiResponse<DashboardStats>>("/dashboard/stats")).data.data
}




//admin
export const adminApi = {
  listUsers: async (params: { search?: string; page?: number; limit?: number }) => {
    const res = await api.get<ApiResponse<AdminUser[]>>("/users", { params })
    return { users: res.data.data, meta: res.data.meta as PageMeta }
  },
  updateUser: async (id: string, body: { roles?: string[]; isActive?: boolean }) =>
    (await api.patch<ApiResponse<Pick<AdminUser, "id" | "name" | "email" | "roles" | "isActive">>>(`/users/${id}`, body))
      .data.data,
  deleteUser: async (id: string) => {
    await api.delete(`/users/${id}`)
  }
}
