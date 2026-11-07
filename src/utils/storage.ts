const ACCESS_KEY = "kitchenmate_access_token"
const REFRESH_KEY = "kitchenmate_refresh_token"
const USER_KEY = "kitchenmate_user"


export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_KEY)
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_KEY)


export const saveTokens = (accessToken: string, refreshToken: string): void => {
     localStorage.setItem(ACCESS_KEY, accessToken)
     localStorage.setItem(REFRESH_KEY, refreshToken)
}


export const saveUser = (user: unknown): void => localStorage.setItem(USER_KEY, JSON.stringify(user))


export const loadUser = <T>(): T | null => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}



export const clearSession = (): void => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}
