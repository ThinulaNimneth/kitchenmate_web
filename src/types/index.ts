export type  UserRole = "ADMIN" | "USER"

export interface User {
  id: string
  name: string
  email: string
  roles: UserRole[]
  isActive: boolean
  createdAt: string
}

export interface AuthPayload{
    user: User
    accessToken: string
    refreshToken: string
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}


export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: PageMeta
}


export interface Category {
  _id: string
  name: string
  icon: string
  color: string
  owner: string | null
  itemCount?: number
}


export interface CategoryRef {
  _id: string
  name: string
  icon: string
  color: string
}


export type Freshness = "fresh" | "expiring" | "expired"
export type ItemStatus = "ACTIVE" | "CONSUMED" | "WASTED"


export interface PantryItem {
  _id: string
  name: string
  category: CategoryRef | null
  quantity: number
  unit: string
  purchaseDate: string
  expirationDate: string
  notes?: string
  status: ItemStatus
  freshness: Freshness
  daysLeft: number
  createdAt: string
}




export interface PantryItemInput {
  name: string
  category: string
  quantity: number
  unit: string
  expirationDate: string
  purchaseDate?: string
  notes?: string
}



export interface PantryFilters {
  search: string
  category: string
  freshness: "" | Freshness
  status: ItemStatus
  sortBy: "expirationDate" | "name" | "createdAt"
  order: "asc" | "desc"
  page: number
  limit: number
}

export interface ShoppingItem {
  _id: string
  name: string
  quantity: number
  unit: string
  checked: boolean
  category?: string | null
}

export interface ShoppingList {
  _id: string
  name: string
  items: ShoppingItem[]
  isArchived: boolean
  createdAt: string
  updatedAt: string
}


export interface RecipeIngredient {
  name: string
  quantity: string
}



export interface Recipe {
  title: string
  description: string
  prepTimeMinutes: number
  cookTimeMinutes: number
  servings: number
  ingredients: RecipeIngredient[]
  pantryStaples: string[]
  steps: string[]
  tip?: string
}




export interface SavedRecipe extends Recipe {
  _id: string
  createdAt: string
}




export interface RecipeBasis {
  name: string
  quantity: number
  unit: string
  daysLeft: number
}



export interface GenerateRecipeParams {
  days: number
  count: number
  servings: number
  mealType: "any" | "breakfast" | "lunch" | "dinner" | "snack"
  dietary?: string
  itemIds?: string[]
}



export interface DashboardStats {
  totals: { active: number; fresh: number; expiring: number; expired: number }
  byCategory: { name: string; icon: string; color: string; count: number }[]
  monthly: { month: string; year: number; consumed: number; wasted: number }[]
  wasteSummary: { consumed: number; wasted: number; savedRate: number | null }
  expiringSoon: PantryItem[]
  openShoppingLists: number
  savedRecipes: number
}



export interface AdminUser extends User {
  pantryItemCount: number
}
