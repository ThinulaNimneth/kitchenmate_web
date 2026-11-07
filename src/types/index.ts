export type  UserRole = "ADMIN" | "USER"

export interface User {
    id: string
    name: string
    email: string
    roles: UserRole[]
    isActive: string
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


