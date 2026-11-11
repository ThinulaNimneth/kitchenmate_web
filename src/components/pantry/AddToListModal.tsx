import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { addListItem, createList, fetchLists } from "../../store/slices/shoppingSlice"
import type { PantryItem } from "../../types"
import { getErrorMessage } from "../../utils/errors"
import { useToast } from "../../hooks/useToast"
import Button from "../ui/Button"
import { Select } from "../ui/Field"
import Modal from "../ui/Modal"

interface AddToListModalProps {
  item: PantryItem | null
  onClose: () => void
}

//low itm to shopping list
export default function AddToListModal({ item, onClose }: AddToListModalProps) {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const lists = useAppSelector((s) => s.shopping.lists)
  const [listId, setListId] = useState("")
  const [saving, setSaving] = useState(false)

  const open = item !== null

  useEffect(() => {
    if (open) void dispatch(fetchLists(false))
  }, [open, dispatch])

  const handleAdd = async () => {
    if (!item) return
    setSaving(true)
    try {
      let targetId = listId || lists[0]?._id
      if (!targetId) {
        //dfult list create,want
        const created = await dispatch(createList("My shopping list")).unwrap()
        targetId = created._id
      }
      await dispatch(
        addListItem({ id: targetId, body: { name: item.name, quantity: 1, unit: item.unit } })
      ).unwrap()
      toast.success(`${item.name} added to your shopping list`)
      onClose()
    } catch (err) {
      toast.error(typeof err === "string" ? err : getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }
  

  return (
    <Modal open={open} onClose={onClose} title="Add to shopping list">
      <p className="mb-4 text-sm text-stone-600">
        Add <strong>{item?.name}</strong> to a shopping list so you can restock it.
      </p>
      {lists.length > 0 && (
        <Select label="Shopping list" value={listId || lists[0]._id} onChange={(e) => setListId(e.target.value)}>
          {lists.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}
            </option>
          ))}
        </Select>
      )}
      {lists.length === 0 && <p className="text-sm text-stone-500">You have no lists yet - we will create one for you.</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button loading={saving} onClick={handleAdd}>
          Add to list
        </Button>
      </div>
    </Modal>
  )
}
