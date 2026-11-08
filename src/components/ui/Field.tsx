import { useId } from "react"
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react"

interface BaseProps {
  label: string
  error?: string
  hint?: string
}

const controlClass = (error?: string) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
    error ? "border-red-400" : "border-stone-300"
  }`

function Wrapper({
  id,
  label,
  error,
  hint,
  children
}: BaseProps & { id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export function Input({ label, error, hint, id, className = "", ...rest }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <Wrapper id={inputId} label={label} error={error} hint={hint}>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`${controlClass(error)} ${className}`}
        {...rest}
      />
    </Wrapper>
  )
}

export function Select({
  label,
  error,
  hint,
  id,
  className = "",
  children,
  ...rest
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <Wrapper id={selectId} label={label} error={error} hint={hint}>
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={`${controlClass(error)} ${className}`}
        {...rest}
      >
        {children}
      </select>
    </Wrapper>
  )
}

export function Textarea({
  label,
  error,
  hint,
  id,
  className = "",
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId()
  const areaId = id ?? autoId
  return (
    <Wrapper id={areaId} label={label} error={error} hint={hint}>
      <textarea
        id={areaId}
        rows={3}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${areaId}-error` : undefined}
        className={`${controlClass(error)} ${className}`}
        {...rest}
      />
    </Wrapper>
  )
}
