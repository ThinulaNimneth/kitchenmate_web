import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { dashboardApi } from "../../api/services"
import type { DashboardStats } from "../../types"
import { getErrorMessage } from "../../utils/errors"

interface DashboardState {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
}


const initialState: DashboardState = { stats: null, loading: false, error: null }


export const fetchDashboardStats = createAsyncThunk<DashboardStats, void, { rejectValue: string }>(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardApi.stats()
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)




const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "dashbord loading failed"
      })
  }
})



export default dashboardSlice.reducer
