import { configureStore } from "@reduxjs/toolkit"
import { setSessionExpiredHandler } from "../api/client"
import authReducer, { sessionExpired } from "./slices/authSlice"
import uiReducer from "./slices/uiSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer
  }
})

// logout user
setSessionExpiredHandler(() => store.dispatch(sessionExpired()))

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch