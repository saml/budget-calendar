import { useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import type { Activity, Budget } from '../../types'
import { useBudgetStore } from '../../store/budgetStore'
import { formatNumber } from '../../utils/budgetUtils'

type ActivityTableRow = {
  date: string
  activity: Activity
  categoryName?: string
}

type ActivityGroup = {
  categoryId?: string
  categoryName: string
  rows: ActivityTableRow[]
  subtotal: number
}

type Props = {
  budget: Budget
}

function deriveGroups(budget: Budget): ActivityGroup[] {
  const groups = new Map<string, ActivityGroup>()

  for (const day of budget.days) {
    for (const activity of day.activities) {
      const category = budget.categories.find((item) => item.id === activity.categoryId)
      const key = category?.id ?? 'uncategorized'
      const current = groups.get(key) ?? {
        categoryId: category?.id,
        categoryName: category?.name ?? 'Uncategorized',
        rows: [],
        subtotal: 0,
      }

      current.rows.push({
        date: day.date,
        activity,
        categoryName: category?.name,
      })
      if (activity.cost !== undefined) {
        current.subtotal += activity.cost * (activity.count ?? 1)
      }

      groups.set(key, current)
    }
  }

  return Array.from(groups.values())
    .sort((left, right) => {
      if (left.categoryId === undefined) return 1
      if (right.categoryId === undefined) return -1
      return left.categoryName.localeCompare(right.categoryName)
    })
    .map((group) => ({
      ...group,
      rows: group.rows.sort((left, right) => {
        const dateComparison = left.date.localeCompare(right.date)
        if (dateComparison !== 0) return dateComparison

        const timeComparison = left.activity.time.localeCompare(right.activity.time)
        if (timeComparison !== 0) return timeComparison

        return left.activity.id.localeCompare(right.activity.id)
      }),
    }))
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

function GroupHeaderRow({ categoryName }: { categoryName: string }) {
  return (
    <tr className="bg-neutral-100 text-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-100">
      <th
        className="border border-neutral-300 px-3 py-2 text-left text-base font-semibold dark:border-neutral-700"
        colSpan={6}
      >
        {categoryName}
      </th>
    </tr>
  )
}

function GroupSubtotalRow({ categoryName, subtotal }: { categoryName: string; subtotal: number }) {
  return (
    <tr className="bg-neutral-50 font-semibold dark:bg-neutral-900/60">
      <td className="border border-neutral-300 px-3 py-2 dark:border-neutral-700" colSpan={5}>
        {`${categoryName} subtotal`}
      </td>
      <td className="border border-neutral-300 px-3 py-2 dark:border-neutral-700">
        {formatNumber(subtotal)}
      </td>
    </tr>
  )
}

export function ActivityTable({ budget }: Props) {
  const groups = deriveGroups(budget)

  if (groups.length === 0) {
    return <div className="p-4 text-sm text-neutral-500">No activities yet</div>
  }

  return (
    <div className="overflow-x-auto p-4">
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
          {groups.flatMap((group) => [
            <GroupHeaderRow key={`${group.categoryId ?? 'uncategorized'}-header`} categoryName={group.categoryName} />,
            ...group.rows.map((row) => (
              <ActivityRow key={`${row.date}-${row.activity.id}`} budget={budget} row={row} />
            )),
            <GroupSubtotalRow
              key={`${group.categoryId ?? 'uncategorized'}-subtotal`}
              categoryName={group.categoryName}
              subtotal={group.subtotal}
            />,
          ])}
        </tbody>
      </table>
    </div>
  )
}
