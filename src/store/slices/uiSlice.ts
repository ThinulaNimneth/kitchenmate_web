import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

export type ToastType = "success" | "error" | "info"

export interface Toast {
  id: number
  type: ToastType
  message: string
}

interface UiState {
  toasts: Toast[]
}

let nextId = 1

const uiSlice = createSlice({
  name: "ui",
  initialState: { toasts: [] } as UiState,
  reducers: {
    addToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload)
      },
      prepare(type: ToastType, message: string) {
        return { payload: { id: nextId++, type, message } }
      }
    },
    removeToast(state, action: PayloadAction<number>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    }
  }
})

export const { addToast, removeToast } = uiSlice.actions
export default uiSlice.reducer
