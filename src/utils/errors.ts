import axios from "axios"


interface ErrorBody {
  message?: string
  details?: { field?: string; message?: string }[]
}


//throw value turn readable msg

export const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError<ErrorBody>(err)) {
    if (!err.response) return " Check your connection and try again."
    const body = err.response.data
    const first = body?.details?.[0]
    if (first?.message) return first.field ? `${first.field}: ${first.message}` : first.message
    return body?.message ?? `Request failed (${err.response.status})`
  }
  if (err instanceof Error) return err.message
  return "something went wrong"
}