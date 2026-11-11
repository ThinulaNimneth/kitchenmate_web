import { useMemo } from "react"
import { useAppDispatch } from "../store/hooks"
import { addToast } from "../store/slices/uiSlice"

export const useToast = () => {
  const dispatch = useAppDispatch()
  return useMemo(
    () => ({
      success: (message: string) => dispatch(addToast("success", message)),
      error: (message: string) => dispatch(addToast("error", message)),
      info: (message: string) => dispatch(addToast("info", message))
    }),
    [dispatch]
  )
}
