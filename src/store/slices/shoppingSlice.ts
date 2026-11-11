import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit"
import { shoppingApi } from "../../api/services"
import type { ListItemInput, MoveToPantryEntry } from "../../api/services"
import type { ShoppingList } from "../../types"
import { getErrorMessage } from "../../utils/errors"

interface ShoppingState {
  lists: ShoppingList[]
  current: ShoppingList | null 
  loading: boolean
  error: string | null
}



const initialState: ShoppingState = { lists: [], current: null, loading: false, error: null }




type Rejected = { rejectValue: string }


export const fetchLists = createAsyncThunk<ShoppingList[], boolean, Rejected>(
  "shopping/fetchLists",
  async (archived, { rejectWithValue }) => {
    try {
      return await shoppingApi.list(archived)
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)



export const fetchList = createAsyncThunk<ShoppingList, string, Rejected>(
  "shopping/fetchList",
  async (id, { rejectWithValue }) => {
    try {
      return await shoppingApi.get(id)
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)




export const createList = createAsyncThunk<ShoppingList, string, Rejected>(
  "shopping/createList",
  async (name, { rejectWithValue }) => {
    try {
      return await shoppingApi.create(name)
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)





export const updateList = createAsyncThunk<
  ShoppingList,
  { id: string; body: { name?: string; isArchived?: boolean } },
  Rejected
>("shopping/updateList", async ({ id, body }, { rejectWithValue }) => {
  try {
    return await shoppingApi.update(id, body)
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})




export const deleteList = createAsyncThunk<string, string, Rejected>(
  "shopping/deleteList",
  async (id, { rejectWithValue }) => {
    try {
      await shoppingApi.remove(id)
      return id
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)




export const addListItem = createAsyncThunk<ShoppingList, { id: string; body: ListItemInput }, Rejected>(
  "shopping/addItem",
  async ({ id, body }, { rejectWithValue }) => {
    try {
      return await shoppingApi.addItem(id, body)
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)




export const updateListItem = createAsyncThunk<
  ShoppingList,
  { id: string; itemId: string; body: Partial<ListItemInput> & { checked?: boolean } },
  Rejected
>("shopping/updateItem", async ({ id, itemId, body }, { rejectWithValue }) => {
  try {
    return await shoppingApi.updateItem(id, itemId, body)
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})




export const removeListItem = createAsyncThunk<ShoppingList, { id: string; itemId: string }, Rejected>(
  "shopping/removeItem",
  async ({ id, itemId }, { rejectWithValue }) => {
    try {
      return await shoppingApi.removeItem(id, itemId)
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)



export const clearCheckedItems = createAsyncThunk<ShoppingList, string, Rejected>(
  "shopping/clearChecked",
  async (id, { rejectWithValue }) => {
    try {
      return await shoppingApi.clearChecked(id)
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)



export const moveToPantry = createAsyncThunk<
  { moved: number; list: ShoppingList },
  { id: string; items: MoveToPantryEntry[] },
  Rejected
>("shopping/moveToPantry", async ({ id, items }, { rejectWithValue }) => {
  try {
    return await shoppingApi.moveToPantry(id, items)
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})



const shoppingSlice = createSlice({
  name: "shopping",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.loading = false
        state.lists = action.payload
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Failed to load lists"
      })
      .addCase(fetchList.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchList.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
      })
      .addCase(fetchList.rejected, (state, action) => {
        state.loading = false
        state.current = null
        state.error = action.payload ?? "Failed to load list"
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.lists.unshift(action.payload)
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter((l) => l._id !== action.payload)
        if (state.current?._id === action.payload) state.current = null
      })
      .addCase(moveToPantry.fulfilled, (state, action) => {
        state.current = action.payload.list
      })
      //list and cunt sync
      .addMatcher(
        isAnyOf(
          updateList.fulfilled,
          addListItem.fulfilled,
          updateListItem.fulfilled,
          removeListItem.fulfilled,
          clearCheckedItems.fulfilled
        ),
        (state, action) => {
          const list = action.payload
          if (state.current?._id === list._id) state.current = list
          const index = state.lists.findIndex((l) => l._id === list._id)
          if (index !== -1) state.lists[index] = list
        }
      )
  }
})




export default shoppingSlice.reducer
