import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { recipeApi } from "../../api/services"
import type { GenerateRecipeParams, Recipe, RecipeBasis, SavedRecipe } from "../../types"
import { getErrorMessage } from "../../utils/errors"

interface RecipeState {
  generated: Recipe[]
  basedOn: RecipeBasis[]
  generating: boolean
  generateError: string | null
  saved: SavedRecipe[]
  loadingSaved: boolean
}



const initialState: RecipeState = {
  generated: [],
  basedOn: [],
  generating: false,
  generateError: null,
  saved: [],
  loadingSaved: false
}



type Rejected = { rejectValue: string }


export const generateRecipes = createAsyncThunk<
  { recipes: Recipe[]; basedOn: RecipeBasis[] },
  GenerateRecipeParams,
  Rejected
>("recipes/generate", async (params, { rejectWithValue }) => {
  try {
    return await recipeApi.generate(params)
  } catch (err) {
    return rejectWithValue(getErrorMessage(err))
  }
})



export const fetchSavedRecipes = createAsyncThunk<SavedRecipe[], void, Rejected>(
  "recipes/fetchSaved",
  async (_, { rejectWithValue }) => {
    try {
      return await recipeApi.list()
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)



export const saveRecipe = createAsyncThunk<SavedRecipe, Recipe, Rejected>(
  "recipes/save",
  async (recipe, { rejectWithValue }) => {
    try {
      return await recipeApi.save(recipe)
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)



export const deleteRecipe = createAsyncThunk<string, string, Rejected>(
  "recipes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await recipeApi.remove(id)
      return id
    } catch (err) {
      return rejectWithValue(getErrorMessage(err))
    }
  }
)


const recipeSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    clearGenerated(state) {
      state.generated = []
      state.basedOn = []
      state.generateError = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateRecipes.pending, (state) => {
        state.generating = true
        state.generateError = null
        state.generated = []
      })
      .addCase(generateRecipes.fulfilled, (state, action) => {
        state.generating = false
        state.generated = action.payload.recipes
        state.basedOn = action.payload.basedOn
      })
      .addCase(generateRecipes.rejected, (state, action) => {
        state.generating = false
        state.generateError = action.payload ?? "Could not generate recipes"
      })
      .addCase(fetchSavedRecipes.pending, (state) => {
        state.loadingSaved = true
      })
      .addCase(fetchSavedRecipes.fulfilled, (state, action) => {
        state.loadingSaved = false
        state.saved = action.payload
      })
      .addCase(fetchSavedRecipes.rejected, (state) => {
        state.loadingSaved = false
      })
      .addCase(saveRecipe.fulfilled, (state, action) => {
        state.saved.unshift(action.payload)
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.saved = state.saved.filter((r) => r._id !== action.payload)
      })
  }
})



export const { clearGenerated } = recipeSlice.actions
export default recipeSlice.reducer
