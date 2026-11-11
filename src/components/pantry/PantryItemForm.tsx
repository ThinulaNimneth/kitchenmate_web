import { useState } from "react"
import type { FormEvent } from "react"
import { useAppSelector } from "../../store/hooks"
import type { PantryItem, PantryItemInput } from "../../types"
import { UNITS } from "../../utils/constants"
import { toInputDate, todayPlus } from "../../utils/date"
import Button from "../ui/Button"
import { Input, Select, Textarea } from "../ui/Field"
import Modal from "../ui/Modal"

interface PantryItemFormProps {
  open: boolean
  item: PantryItem | null 
  submitting: boolean
  onClose: () => void
  onSubmit: (values: PantryItemInput) => void
}


type FormErrors = Partial<Record<"name" | "category" | "quantity" | "expirationDate", string>>


//reset on opn
function FormBody({ item, submitting, onClose, onSubmit }: Omit<PantryItemFormProps, "open">) {
  const categories = useAppSelector((s) => s.categories.items)

  const [name, setName] = useState(item?.name ?? "")
  const [category, setCategory] = useState(item?.category?._id ?? "")
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1))
  const [unit, setUnit] = useState(item?.unit ?? "pcs")
  const [expirationDate, setExpirationDate] = useState(item ? toInputDate(item.expirationDate) : todayPlus(7))
  const [notes, setNotes] = useState(item?.notes ?? "")
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    if (name.trim().length < 2) next.name = "Name must be at least 2 characters"
    if (!category) next.category = "Please choose a category"
    if (quantity === "" || Number(quantity) < 0 || Number.isNaN(Number(quantity))) {
      next.quantity = "Enter a quantity of 0 or more"
    }
    if (!expirationDate) next.expirationDate = "Expiration date is required"
    return next
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    onSubmit({
      name: name.trim(),
      category,
      quantity: Number(quantity),
      unit,
      expirationDate,
      notes: notes.trim() || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Whole milk"
        error={errors.name}
        autoFocus
      />

      <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} error={errors.category}>
        <option value="">Select a category...</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.icon} {c.name}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantity"
          type="number"
          min="0"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={errors.quantity}
        />
        <Select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="Expiration date"
        type="date"
        value={expirationDate}
        onChange={(e) => setExpirationDate(e.target.value)}
        error={errors.expirationDate}
      />

      <Textarea
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={300}
        placeholder="Opened on Monday, keep in the fridge door..."
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {item ? "Save changes" : "Add to pantry"}
        </Button>
      </div>
    </form>
  )
}

export default function PantryItemForm(props: PantryItemFormProps) {
  const { open, item, onClose } = props
  return (
    <Modal open={open} onClose={onClose} title={item ? "Edit pantry item" : "Add pantry item"}>
      <FormBody {...props} />
    </Modal>
  )
}
