import axios from "axios"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"
import type { ApiResponse, AuthPayload } from "../types"
import { clearSession, getAccessToken, getRefreshToken, saveTokens } from "../utils/storage"



export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api"

export const api = axios.create({ baseURL: API_URL, timeout: 30000 })


//avoids circular import
let onSessionExpired: (() => void) | null = null
export const setSessionExpiredHandler = (handler: () => void): void => {
  onSessionExpired = handler
}


//access tken attach req..
api.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) config.headers.Authorization =  `Bearer ${token}`
    return config
})


// refresh expired token retr
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }
let refreshing: Promise<string> | null = null

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error("No refresh token")


  const res = await axios.post<ApiResponse<AuthPayload>>(`${API_URL}/auth/refresh`, { refreshToken })
  const { accessToken, refreshToken: newRefresh } = res.data.data
  saveTokens(accessToken, newRefresh)
  return accessToken
}


const AUTH_URLS = ["/auth/login", "/auth/register", "/auth/refresh"]



api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined
    const isAuthCall = AUTH_URLS.some((url) => original?.url?.startsWith(url))

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall && getRefreshToken()) {
      original._retry = true
      try {
        // use one refresh for all failed requests
        refreshing = refreshing ?? refreshAccessToken().finally(() => (refreshing = null))
        const newToken = await refreshing
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        clearSession()
        onSessionExpired?.()
      }
    }
    return Promise.reject(error)
  }
)