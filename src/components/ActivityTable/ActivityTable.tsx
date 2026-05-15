import { useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import type { Activity, Budget } from '../../types'
import { useBudgetStore } from '../../store/budgetStore'
import { formatNumber } from '../../utils/budgetUtils'

type SortBy = 'date' | 'category'

type ActivityTableRow = {
  date: string
  activity: Activity
  categoryName?: string
}

type Props = {
  budget: Budget
}

function deriveRows(budget: Budget, sortBy: SortBy): ActivityTableRow[] {
  const rows = budget.days.flatMap((day) =>
    day.activities.map((activity) => ({
      date: day.date,
      activity,
      categoryName: budget.categories.find((category) => category.id === activity.categoryId)?.name,
    })),
  )

  return rows.sort((left, right) => {
    if (sortBy === 'category') {
      const leftUncategorized = !left.categoryName
      const rightUncategorized = !right.categoryName

      if (leftUncategorized !== rightUncategorized) {
        return leftUncategorized ? 1 : -1
      }

      const categoryComparison = (left.categoryName ?? '').localeCompare(right.categoryName ?? '')
      if (categoryComparison !== 0) return categoryComparison
    }

    const dateComparison = left.date.localeCompare(right.date)
    if (dateComparison !== 0) return dateComparison

    const timeComparison = left.activity.time.localeCompare(right.activity.time)
    if (timeComparison !== 0) return timeComparison

    return left.activity.id.localeCompare(right.activity.id)
  })
}

function formatTotalPrice(activity: Activity): string {
  if (activity.cost === undefined) return '—'
  return formatNumber(activity.cost * (activity.count ?? 1))
}

type EditableCellProps = {
  display: ReactNode
  onActivate: () => void
  editing: boolean
  children: ReactNode
}

function EditableCell({ display, onActivate, editing, children }: EditableCellProps) {
  return (
    <td
      className="border border-neutral-300 px-3 py-2 align-top dark:border-neutral-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
      onClick={!editing ? onActivate : undefined}
    >
      {editing ? children : display}
    </td>
  )
}

function SortControls({
  sortBy,
  onSortChange,
}: {
  sortBy: SortBy
  onSortChange: (sortBy: SortBy) => void
}) {
  return (
    <div className="mb-4 flex gap-2">
      <button
        type="button"
        onClick={() => onSortChange('date')}
        aria-pressed={sortBy === 'date'}
      >
        Sort by date
      </button>
      <button
        type="button"
        onClick={() => onSortChange('category')}
        aria-pressed={sortBy === 'category'}
      >
        Sort by category
      </button>
    </div>
  )
}

function ActivityRow({ row, budget }: { row: ActivityTableRow; budget: Budget }) {
  const updateActivity = useBudgetStore((state) => state.updateActivity)
  const ignoreNextBlurRef = useRef(false)
  const [editingField, setEditingField] = useState<
    'category' | 'description' | 'cost' | 'count' | null
  >(null)
  const [draft, setDraft] = useState<Partial<Activity>>({})

  function startEdit(field: 'category' | 'description' | 'cost' | 'count') {
    setDraft({
      description: row.activity.description,
      cost: row.activity.cost,
      count: row.activity.count,
      categoryId: row.activity.categoryId,
    })
    setEditingField(field)
  }

  function commit() {
    if (!editingField) return

    updateActivity(row.date, {
      ...row.activity,
      ...draft,
    })
    setEditingField(null)
  }

  function cancel() {
    setEditingField(null)
  }

  function handleBlur() {
    if (ignoreNextBlurRef.current) {
      ignoreNextBlurRef.current = false
      return
    }
    commit()
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault()
      ignoreNextBlurRef.current = true
      commit()
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      ignoreNextBlurRef.current = true
      cancel()
    }
  }

  return (
    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
      <td className="border border-neutral-300 px-3 py-2 whitespace-nowrap align-top dark:border-neutral-700">
        {`${row.date} ${row.activity.time}`}
      </td>
      <EditableCell
        display={row.categoryName ?? '—'}
        onActivate={() => startEdit('category')}
        editing={editingField === 'category'}
      >
        <select
          aria-label="Category"
          autoFocus
          className="w-full rounded border border-neutral-300 bg-white px-1 py-0.5 dark:border-neutral-600 dark:bg-neutral-800"
          value={draft.categoryId ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              categoryId: event.target.value || undefined,
            }))
          }
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        >
          <option value="">None</option>
          {budget.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </EditableCell>
      <EditableCell
        display={row.activity.description}
        onActivate={() => startEdit('description')}
        editing={editingField === 'description'}
      >
        <input
          aria-label="Description"
          autoFocus
          className="w-full rounded border border-neutral-300 bg-white px-1 py-0.5 dark:border-neutral-600 dark:bg-neutral-800"
          type="text"
          value={draft.description ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </EditableCell>
      <EditableCell
        display={row.activity.cost === undefined ? '—' : row.activity.count ?? 1}
        onActivate={() => startEdit('count')}
        editing={editingField === 'count'}
      >
        <input
          aria-label="Count"
          autoFocus
          className="w-16 rounded border border-neutral-300 bg-white px-1 py-0.5 dark:border-neutral-600 dark:bg-neutral-800"
          min={1}
          type="number"
          value={draft.count ?? 1}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              count: Number(event.target.value),
            }))
          }
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </EditableCell>
      <EditableCell
        display={row.activity.cost === undefined ? '—' : formatNumber(row.activity.cost)}
        onActivate={() => startEdit('cost')}
        editing={editingField === 'cost'}
      >
        <input
          aria-label="Cost"
          autoFocus
          className="w-24 rounded border border-neutral-300 bg-white px-1 py-0.5 dark:border-neutral-600 dark:bg-neutral-800"
          type="number"
          value={draft.cost ?? ''}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              cost: event.target.value === '' ? undefined : Number(event.target.value),
            }))
          }
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </EditableCell>
      <td className="border border-neutral-300 px-3 py-2 align-top dark:border-neutral-700">
        {formatTotalPrice(row.activity)}
      </td>
    </tr>
  )
}

export function ActivityTable({ budget }: Props) {
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const rows = deriveRows(budget, sortBy)

  return (
    <div className="overflow-x-auto p-4">
      <SortControls sortBy={sortBy} onSortChange={setSortBy} />
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-neutral-300 bg-neutral-50 px-3 py-2 text-left font-semibold dark:border-neutral-700 dark:bg-neutral-800">
              Datetime
            </th>
            <th className="border border-neutral-300 bg-neutral-50 px-3 py-2 text-left font-semibold dark:border-neutral-700 dark:bg-neutral-800">
              Category
            </th>
            <th className="border border-neutral-300 bg-neutral-50 px-3 py-2 text-left font-semibold dark:border-neutral-700 dark:bg-neutral-800">
              Description
            </th>
            <th className="border border-neutral-300 bg-neutral-50 px-3 py-2 text-left font-semibold dark:border-neutral-700 dark:bg-neutral-800">
              Count
            </th>
            <th className="border border-neutral-300 bg-neutral-50 px-3 py-2 text-left font-semibold dark:border-neutral-700 dark:bg-neutral-800">
              Cost
            </th>
            <th className="border border-neutral-300 bg-neutral-50 px-3 py-2 text-left font-semibold dark:border-neutral-700 dark:bg-neutral-800">
              Total Price
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ActivityRow key={`${row.date}-${row.activity.id}`} budget={budget} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
