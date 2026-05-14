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
  const [duration, setDuration] = useState(activity?.duration ?? 30)
  const [count, setCount] = useState(activity?.count ?? 1)
  const [categoryId, setCategoryId] = useState(activity?.categoryId ?? '')

  const isEditMode = Boolean(activity)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-800"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">
          {isEditMode ? 'Edit activity' : 'New activity'}
        </h2>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            const payload = {
              time,
              description: description.trim(),
              cost: cost === '' ? undefined : Number(cost),
              count: cost === '' ? undefined : count,
              categoryId: categoryId || undefined,
              duration,
            }

            if (isEditMode && activity) {
              updateActivity(date, { ...activity, ...payload })
            } else {
              addActivity(date, payload)
            }
            onClose()
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            Time
            <input
              aria-label="Time"
              type="time"
              className="rounded border border-neutral-300 bg-white px-2 py-1.5 dark:border-neutral-600 dark:bg-neutral-800"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Duration (minutes)
            <input
              aria-label="Duration"
              type="number"
              min={1}
              className="rounded border border-neutral-300 bg-white px-2 py-1.5 dark:border-neutral-600 dark:bg-neutral-800"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Description
            <input
              aria-label="Description"
              className="rounded border border-neutral-300 bg-white px-2 py-1.5 dark:border-neutral-600 dark:bg-neutral-800"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Cost
            <input
              aria-label="Cost"
              type="number"
              className="rounded border border-neutral-300 bg-white px-2 py-1.5 dark:border-neutral-600 dark:bg-neutral-800"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
          </label>
          {cost !== '' ? (
            <label className="flex flex-col gap-1 text-sm">
              Count
              <input
                aria-label="Count"
                type="number"
                min={1}
                className="rounded border border-neutral-300 bg-white px-2 py-1.5 dark:border-neutral-600 dark:bg-neutral-800"
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
              />
            </label>
          ) : null}
          <label className="flex flex-col gap-1 text-sm">
            Category
            <select
              aria-label="Category"
              className="rounded border border-neutral-300 bg-white px-2 py-1.5 dark:border-neutral-600 dark:bg-neutral-800"
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
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
            >
              Cancel
            </button>
            {isEditMode ? (
              <button
                type="button"
                onClick={() => {
                  if (!activity) return
                  deleteActivity(date, activity.id)
                  onClose()
                }}
                className="rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete activity
              </button>
            ) : null}
            <button
              type="submit"
              className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:opacity-80 dark:bg-neutral-50 dark:text-neutral-900"
            >
              {isEditMode ? 'Save' : 'Add activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
