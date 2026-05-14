import { useState } from 'react'
import type { Activity, Budget } from '../../types'
import { useBudgetStore } from '../../store/budgetStore'

type ActivityFormProps = {
  budget: Budget
  date: string
  activity?: Activity
  onClose: () => void
}

export function ActivityForm({
  budget,
  date,
  activity,
  onClose,
}: ActivityFormProps) {
  const addActivity = useBudgetStore((state) => state.addActivity)
  const updateActivity = useBudgetStore((state) => state.updateActivity)
  const deleteActivity = useBudgetStore((state) => state.deleteActivity)

  const [time, setTime] = useState(activity?.time ?? '')
  const [description, setDescription] = useState(activity?.description ?? '')
  const [cost, setCost] = useState(
    activity?.cost === undefined ? '' : String(activity.cost),
  )
  const [categoryId, setCategoryId] = useState(activity?.categoryId ?? '')

  const isEditMode = Boolean(activity)

  return (
    <div role="dialog" aria-modal="true">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const payload = {
            time,
            description: description.trim(),
            cost: cost === '' ? undefined : Number(cost),
            categoryId: categoryId || undefined,
          }

          if (isEditMode && activity) {
            updateActivity(date, { ...activity, ...payload })
          } else {
            addActivity(date, payload)
          }
          onClose()
        }}
      >
        <label>
          Time
          <input
            aria-label="Time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </label>
        <label>
          Description
          <input
            aria-label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label>
          Cost
          <input
            aria-label="Cost"
            type="number"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
          />
        </label>
        <label>
          Category
          <select
            aria-label="Category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">None</option>
            {budget.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">{isEditMode ? 'Save activity' : 'Add activity'}</button>
        {isEditMode ? (
          <button
            type="button"
            onClick={() => {
              if (!activity) return
              deleteActivity(date, activity.id)
              onClose()
            }}
          >
            Delete activity
          </button>
        ) : null}
      </form>
    </div>
  )
}
