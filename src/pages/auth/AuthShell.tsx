import type { ReactNode } from "react"

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-2xl" aria-hidden="true">
            🥕
          </span>
          <span className="text-2xl font-extrabold tracking-tight">PantryPal</span>
        </div>
        <div>
          <h2 className="max-w-md text-4xl font-extrabold leading-tight">Stop throwing food away. Start cooking with it.</h2>
          <p className="mt-4 max-w-md text-emerald-50">
            Track what is in your pantry, get warned before it expires, and let ai turn your soon to expire
            ingredients into tonight&apos;s dinner.
          </p>
          <ul className="mt-8 space-y-3 text-sm font-medium">
            <li>🟢 Colour-coded freshness at a glance</li>
            <li>🛒 Smart shopping lists that feed your pantry</li>
            <li>🍳 Gemini AI recipes from what you already own</li>
          </ul>
        </div>
        <p className="text-xs text-emerald-100">Cut household food waste, one meal at a time.</p>
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/10" aria-hidden="true" />
      </div>

      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-xl" aria-hidden="true">
              🥕
            </span>
            <span className="text-xl font-extrabold text-stone-900">PantryPal</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">{title}</h1>
          <p className="mt-2 text-sm text-stone-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
