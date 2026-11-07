import type { ApiResponse, AuthPayload, User } from "../types"
import { api } from "./client"



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