import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { pantryApi } from "../../api/services"
import type { PageMeta, PantryFilters, PantryItem, PantryItemInput } from "../../types"
import { getErrorMessage } from "../../utils/errors"


interface PantryState {
  items: PantryItem[]
  meta: PageMeta
  filters: PantryFilters
  loading: boolean
  error: string | null
}



export const defaultFilters: PantryFilters = {
  search: "",
  category: "",
  freshness: "",
  status: "ACTIVE",
  sortBy: "expirationDate",
  order: "asc",
  page: 1,
  limit: 12
}


const initialState: PantryState = {
  items: [],
  meta: { page: 1, limit: 12, total: 0, totalPages: 1 },
  filters: defaultFilters,
  loading: false,
  error: null
}



export const fetchPantryItems = createAsyncThunk<
  { items: PantryItem[]; meta: PageMeta },
  PantryFilters,
  { rejectValue: string }
>("pantry/fetch", async (filters, { rejectWithValue }) => {
  try {
    return await pantryApi.list(filters)
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})




export const createPantryItem = createAsyncThunk<PantryItem, PantryItemInput, { rejectValue: string }>(
  "pantry/create",
  async (body, { rejectWithValue }) => {
    try {
      return await pantryApi.create(body)
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)



export const updatePantryItem = createAsyncThunk<
  PantryItem,
  { id: string; body: Partial<PantryItemInput> },
  { rejectValue: string }
>("pantry/update", async ({ id, body }, { rejectWithValue }) => {
  try {
    return await pantryApi.update(id, body)
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})



export const setPantryItemStatus = createAsyncThunk<
  PantryItem,
  { id: string; status: PantryItem["status"] },
  { rejectValue: string }
>("pantry/setStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    return await pantryApi.setStatus(id, status)
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})



export const deletePantryItem = createAsyncThunk<string, string, { rejectValue: string }>(
  "pantry/delete",
  async (id, { rejectWithValue }) => {
    try {
      await pantryApi.remove(id)
      return id
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)





const pantrySlice = createSlice({
  name: "pantry",
  initialState,
  reducers: {
    //reset pge filter change
    setFilters(state, action: PayloadAction<Partial<PantryFilters>>) {
      const resetPage = action.payload.page === undefined
      state.filters = { ...state.filters, ...action.payload, ...(resetPage ? { page: 1 } : {}) }
    },
    resetFilters(state) {
      state.filters = defaultFilters
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPantryItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPantryItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.meta = action.payload.meta
      })
      .addCase(fetchPantryItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Failed to load pantry"
      })
      .addCase(updatePantryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex((i) => i._id === action.payload._id)
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(setPantryItemStatus.fulfilled, (state, action) => {
        //move item drop
        if (action.payload.status !== state.filters.status) {
          state.items = state.items.filter((i) => i._id !== action.payload._id)
          state.meta.total = Math.max(0, state.meta.total - 1)
        }
      })
      .addCase(deletePantryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload)
        state.meta.total = Math.max(0, state.meta.total - 1)
      })
  }
})




export const { setFilters, resetFilters } = pantrySlice.actions
export default pantrySlice.reducer
