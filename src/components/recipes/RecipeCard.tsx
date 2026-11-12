import type { Recipe } from "../../types"
import Button from "../ui/Button"

interface RecipeCardProps {
  recipe: Recipe
  saving?: boolean
  onSave?: () => void
  onDelete?: () => void
}


export default function RecipeCard({ recipe, saving = false, onSave, onDelete }: RecipeCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-5 text-white">
        <h3 className="text-xl font-extrabold leading-snug">{recipe.title}</h3>
        {recipe.description && <p className="mt-1 text-sm text-emerald-50">{recipe.description}</p>}
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white/20 px-3 py-1">⏱ Prep {recipe.prepTimeMinutes} min</span>
          <span className="rounded-full bg-white/20 px-3 py-1">🔥 Cook {recipe.cookTimeMinutes} min</span>
          <span className="rounded-full bg-white/20 px-3 py-1">🍽 Serves {recipe.servings}</span>
        </div>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">From your pantry</h4>
          <ul className="space-y-1.5 text-sm">
            {recipe.ingredients.map((ing, i) => (
              <li key={`${ing.name}-${i}`} className="flex justify-between gap-3 border-b border-stone-100 pb-1.5">
                <span className="font-medium text-stone-800">{ing.name}</span>
                <span className="text-stone-500">{ing.quantity}</span>
              </li>
            ))}
          </ul>
          {recipe.pantryStaples.length > 0 && (
            <p className="mt-3 text-xs text-stone-500">
              <span className="font-semibold">Basics needed:</span> {recipe.pantryStaples.join(", ")}
            </p>
          )}
        </div>

        <div className="md:col-span-3">
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">Method</h4>
          <ol className="space-y-3 text-sm text-stone-700">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          {recipe.tip && (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              💡 <span className="font-semibold">Zero-waste tip:</span> {recipe.tip}
            </p>
          )}
        </div>
      </div>

      {(onSave || onDelete) && (
        <div className="flex justify-end gap-3 border-t border-stone-100 bg-stone-50 px-6 py-3">
          {onDelete && (
            <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={onDelete}>
              Delete
            </Button>
          )}
          {onSave && (
            <Button loading={saving} onClick={onSave}>
              ♡ Save recipe
            </Button>
          )}
        </div>
      )}
    </article>
  )
}
