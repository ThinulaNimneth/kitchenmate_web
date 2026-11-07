import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { authApi } from "../../api/services"
import type { AuthPayload, User } from "../../types"
import { getErrorMessage } from "../../utils/errors"
import { clearSession, getAccessToken, loadUser, saveTokens, saveUser } from "../../utils/storage"



interface AuthState {
  user: User | null
  loading: boolean 
  initializing: boolean // validate session on startup
  error: string | null
}


const hasSession = Boolean(getAccessToken())


const initialState: AuthState = {
  user: hasSession ? loadUser<User>() : null,
  loading: false,
  initializing: hasSession,
  error: null
}


const persist = (payload: AuthPayload) => {
    saveTokens(payload.accessToken, payload.refreshToken)
    saveUser(payload.user)
}


export const login = createAsyncThunk<User, { email: string; password: string }, { rejectValue: string }>(
  "auth/login",
  async (body, { rejectWithValue }) => {
    try {
      const payload = await authApi.login(body)
      persist(payload)
      return payload.user
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)


export const register = createAsyncThunk<
  User,
  { name: string; email: string; password: string },
  { rejectValue: string }
>("auth/register", async (body, { rejectWithValue }) => {
  try {
    const payload = await authApi.register(body)
    persist(payload)
    return payload.user
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})



// checking saved token

export const fetchMe = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.me()
      saveUser(user)
      return user
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)



export const logout = createAsyncThunk<void, void>("auth/logout", async () => {
  try {
    await authApi.logout()
  } catch {
    //clear lcal session
  }
  clearSession()
})


export const updateProfile = createAsyncThunk<User, { name: string }, { rejectValue: string }>(
  "auth/updateProfile",
  async (body, { rejectWithValue }) => {
    try {
      const user = await authApi.updateProfile(body)
      saveUser(user)
      return user
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)



export const changePassword = createAsyncThunk< void,
  { currentPassword: string; newPassword: string },
  { rejectValue: string }
>("auth/changePassword", async (body, { rejectWithValue }) => {
  try {
    persist(await authApi.changePassword(body))
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})





const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // dispatched by the axios interceptor when the refresh token is no longer valid
    sessionExpired(state) {
      state.user = null
      state.initializing = false
    },
    clearAuthError(state) {
      state.error = null
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Login failed"
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Registration failed"
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
        state.initializing = false
      })
      .addCase(fetchMe.rejected, (state) => {
        // token invalid and refresh failed -> back to login
        clearSession()
        state.user = null
        state.initializing = false
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })
  }
})



export const { sessionExpired, clearAuthError, setUser} = authSlice.actions
export default authSlice.reducer