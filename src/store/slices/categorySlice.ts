import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { categoryApi } from "../../api/services"
import type { CategoryInput } from "../../api/services"
import type { Category } from "../../types"
import { getErrorMessage } from "../../utils/errors"



interface CategoryState {
  items: Category[]
  loading: boolean
  loaded: boolean
  error: string | null
}



const initialState: CategoryState = { items: [], loading: false, loaded: false, error: null }


export const fetchCategories = createAsyncThunk<Category[], void, { rejectValue: string }>(
  "categories/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await categoryApi.list()
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)



export const createCategory = createAsyncThunk<Category, CategoryInput, { rejectValue: string }>(
  "categories/create",
  async (body, { rejectWithValue }) => {
    try {
      return await categoryApi.create(body)
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)




export const updateCategory = createAsyncThunk<
  Category,
  { id: string; body: Partial<CategoryInput> },
  { rejectValue: string }
>("categories/update", async ({ id, body }, { rejectWithValue }) => {
  try {
    return await categoryApi.update(id, body)
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})



export const deleteCategory = createAsyncThunk<string, string, { rejectValue: string }>(
  "categories/delete",
  async (id, { rejectWithValue }) => {
    try {
      await categoryApi.remove(id)
      return id
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)



const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.loaded = true
        state.items = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "failed to load categories"
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push({ ...action.payload, itemCount: 0 })
        state.items.sort((a, b) => a.name.localeCompare(b.name))
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c._id === action.payload._id)
        if (index !== -1) {
          state.items[index] = { ...action.payload, itemCount: state.items[index].itemCount }
        }
        state.items.sort((a, b) => a.name.localeCompare(b.name))
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload)
      })
  }
})


export default categorySlice.reducer