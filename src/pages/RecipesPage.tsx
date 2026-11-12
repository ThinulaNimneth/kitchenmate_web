import { useEffect, useState } from "react"
import { pantryApi } from "../api/services"
import RecipeCard from "../components/recipes/RecipeCard"
import Button from "../components/ui/Button"
import EmptyState from "../components/ui/EmptyState"
import { Input, Select } from "../components/ui/Field"
import FreshnessBadge from "../components/ui/FreshnessBadge"
import PageHeader from "../components/ui/PageHeader"
import { PageSpinner } from "../components/ui/Spinner"
import { useToast } from "../hooks/useToast"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { clearGenerated, deleteRecipe, fetchSavedRecipes, generateRecipes, saveRecipe } from "../store/slices/recipeSlice"
import type { GenerateRecipeParams, PantryItem, Recipe } from "../types"
import { MEAL_TYPES } from "../utils/constants"
import { getErrorMessage } from "../utils/errors"

type Tab = "generate" | "saved"



export default function RecipesPage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { generated, basedOn, generating, generateError, saved, loadingSaved } = useAppSelector((s) => s.recipes)

  const [tab, setTab] = useState<Tab>("generate")
  const [days, setDays] = useState(3)
  const [count, setCount] = useState(2)
  const [servings, setServings] = useState(2)
  const [mealType, setMealType] = useState<GenerateRecipeParams["mealType"]>("any")
  const [dietary, setDietary] = useState("")

  const [expiring, setExpiring] = useState<PantryItem[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [savingTitle, setSavingTitle] = useState<string | null>(null)

  //wen day change incredian reloading
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoadingItems(true)
      try {
        const items = await pantryApi.expiring(days)
        if (cancelled) return
        setExpiring(items)
        setSelected(new Set(items.map((i) => i._id)))
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoadingItems(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [days, toast])

  useEffect(() => {
    void dispatch(fetchSavedRecipes())
  }, [dispatch])

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleGenerate = async () => {
    const params: GenerateRecipeParams = {
      days,
      count,
      servings,
      mealType,
      ...(dietary.trim() ? { dietary: dietary.trim() } : {}),
      //unchec itm id
      ...(selected.size !== expiring.length ? { itemIds: Array.from(selected) } : {})
    }
    const result = await dispatch(generateRecipes(params))
    if (generateRecipes.rejected.match(result)) toast.error(result.payload ?? "Could not generate recipes")
  }

  const handleSave = async (recipe: Recipe) => {
    setSavingTitle(recipe.title)
    try {
      await dispatch(saveRecipe(recipe)).unwrap()
      toast.success("Recipe saved to My recipes")
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    } finally {
      setSavingTitle(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteRecipe(id)).unwrap()
      toast.success("Recipe deleted")
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    }
  }

  return (
    <div>
      <PageHeader
        title="AI Recipe Generator"
        subtitle="Gemini turns the ingredients that are about to expire into real meals."
      />

      <div className="mb-6 inline-flex rounded-xl bg-stone-200/70 p-1" role="tablist" aria-label="Recipes">
        {(
          [
            { value: "generate", label: "✨ Generate" },
            { value: "saved", label: `📖 My recipes (${saved.length})` }
          ] as { value: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.value ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "generate" && (
        <div className="space-y-6">
          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm" aria-labelledby="ing-title">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="ing-title" className="text-lg font-bold text-stone-900">
                  Ingredients expiring soon
                </h2>
                <p className="text-sm text-stone-500">Only these ingredients will be used. Untick anything you do not want.</p>
              </div>
              <div className="w-44">
                <Select label="Expiring within" value={days} onChange={(e) => setDays(Number(e.target.value))}>
                  {[1, 2, 3, 5, 7, 14].map((d) => (
                    <option key={d} value={d}>
                      {d} day{d === 1 ? "" : "s"}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {loadingItems ? (
              <PageSpinner label="Checking your pantry..." />
            ) : expiring.length === 0 ? (
              <p className="rounded-2xl bg-emerald-50 px-4 py-5 text-center text-sm text-emerald-800">
                🎉 Nothing expires within {days} day{days === 1 ? "" : "s"}. Try a longer window.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {expiring.map((item) => (
                  <li key={item._id}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                        selected.has(item._id) ? "border-emerald-300 bg-emerald-50" : "border-stone-200 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(item._id)}
                        onChange={() => toggle(item._id)}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-stone-800">{item.name}</span>
                        <span className="text-xs text-stone-500">
                          {item.quantity} {item.unit}
                        </span>
                      </span>
                      <FreshnessBadge freshness={item.freshness} daysLeft={item.daysLeft} />
                    </label>
                  </li>
                ))}
              </ul>
            )}
            

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Select label="Meal type" value={mealType} onChange={(e) => setMealType(e.target.value as GenerateRecipeParams["mealType"])}>
                {MEAL_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </Select>
              <Select label="Recipes" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
              <Input label="Servings" type="number" min={1} max={12} value={servings} onChange={(e) => setServings(Math.min(12, Math.max(1, Number(e.target.value) || 1)))} />
              <Input label="Dietary (optional)" value={dietary} onChange={(e) => setDietary(e.target.value)} placeholder="e.g. vegetarian" maxLength={80} />
            </div>

            <div className="mt-5 flex justify-end">
              <Button onClick={handleGenerate} loading={generating} disabled={loadingItems || selected.size === 0}>
                ✨ Generate recipes
              </Button>
            </div>
          </section>

          {generating && <PageSpinner label="Gemini is cooking up ideas... this can take up to 20 seconds" />}

          {generateError && !generating && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {generateError}
            </div>
          )}

          {generated.length > 0 && !generating && (
            <section className="space-y-5" aria-label="Generated recipes">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500">
                  Based on: <span className="font-semibold text-stone-700">{basedOn.map((b) => b.name).join(", ")}</span>
                </p>
                <Button size="sm" variant="ghost" onClick={() => dispatch(clearGenerated())}>
                  Clear
                </Button>
              </div>
              {generated.map((recipe, index) => (
                <RecipeCard
                  key={`${recipe.title}-${index}`}
                  recipe={recipe}
                  saving={savingTitle === recipe.title}
                  onSave={() => handleSave(recipe)}
                />
              ))}
            </section>
          )}
        </div>
      )}

      {tab === "saved" &&
        (loadingSaved && saved.length === 0 ? (
          <PageSpinner />
        ) : saved.length === 0 ? (
          <EmptyState
            icon="📖"
            title="No saved recipes yet"
            description="Generate a recipe and tap “Save recipe” to keep it here."
            action={<Button onClick={() => setTab("generate")}>✨ Generate one</Button>}
          />
        ) : (
          <div className="space-y-5">
            {saved.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} onDelete={() => handleDelete(recipe._id)} />
            ))}
          </div>
        ))}
    </div>
  )
}
