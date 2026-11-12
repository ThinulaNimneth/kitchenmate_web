import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { adminApi } from "../../api/services"
import type { AdminUser, PageMeta } from "../../types"
import { getErrorMessage } from "../../utils/errors"

interface AdminState {
  users: AdminUser[]
  meta: PageMeta
  loading: boolean
  error: string | null
}



const initialState: AdminState = {
  users: [],
  meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
  loading: false,
  error: null
}



type Rejected = { rejectValue: string }

export const fetchUsers = createAsyncThunk<
  { users: AdminUser[]; meta: PageMeta },
  { search?: string; page?: number },
  Rejected
>("admin/fetchUsers", async (params, { rejectWithValue }) => {
  try {
    return await adminApi.listUsers({ ...params, limit: 10 })
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})



export const updateUser = createAsyncThunk<
  { id: string; roles: AdminUser["roles"]; isActive: boolean },
  { id: string; body: { roles?: string[]; isActive?: boolean } },
  Rejected
>("admin/updateUser", async ({ id, body }, { rejectWithValue }) => {
  try {
    const user = await adminApi.updateUser(id, body)
    return { id: user.id, roles: user.roles, isActive: user.isActive }
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})


export const deleteUser = createAsyncThunk<string, string, Rejected>(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await adminApi.deleteUser(id)
      return id
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)


const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.users
        state.meta = action.payload.meta
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Failed to load users"
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload.id)
        if (user) {
          user.roles = action.payload.roles
          user.isActive = action.payload.isActive
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload)
        state.meta.total = Math.max(0, state.meta.total - 1)
      })
  }
})



export default adminSlice.reducer
