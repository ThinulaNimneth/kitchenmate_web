import { configureStore } from "@reduxjs/toolkit"
import { setSessionExpiredHandler } from "../api/client"
import adminReducer from "./slices/adminSlice"
import authReducer, { sessionExpired } from "./slices/authSlice"
import categoryReducer from "./slices/categorySlice"
import dashboardReducer from "./slices/dashboardSlice"
import pantryReducer from "./slices/pantrySlice"
import recipeReducer from "./slices/recipeSlice"
import shoppingReducer from "./slices/shoppingSlice"
import uiReducer from "./slices/uiSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pantry: pantryReducer,
    categories: categoryReducer,
    shopping: shoppingReducer,
    recipes: recipeReducer,
    dashboard: dashboardReducer,
    admin: adminReducer,
    ui: uiReducer
  }
})

// logout user on refresh token fail
setSessionExpiredHandler(() => store.dispatch(sessionExpired()))

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch