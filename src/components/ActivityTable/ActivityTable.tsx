import { useState } from 'react'
import type { Activity, Budget } from '../../types'
import { formatNumber } from '../../utils/budgetUtils'

type SortBy = 'date' | 'category'

type ActivityRow = {
  date: string
  activity: Activity
  categoryName?: string
}

type Props = {
  budget: Budget
}

function deriveRows(budget: Budget, sortBy: SortBy): ActivityRow[] {
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

function ActivityRow({ row }: { row: ActivityRow }) {
  return (
    <tr>
      <td>{row.categoryName ?? '—'}</td>
      <td>{`${row.date} ${row.activity.time}`}</td>
      <td>{row.activity.description}</td>
      <td>{row.activity.cost === undefined ? '—' : row.activity.count ?? 1}</td>
      <td>{row.activity.cost === undefined ? '—' : formatNumber(row.activity.cost)}</td>
      <td>{formatTotalPrice(row.activity)}</td>
    </tr>
  )
}

export function ActivityTable({ budget }: Props) {
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const rows = deriveRows(budget, sortBy)

  return (
    <div className="p-4">
      <SortControls sortBy={sortBy} onSortChange={setSortBy} />
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Date &amp; Time</th>
            <th>Description</th>
            <th>Count</th>
            <th>Cost</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ActivityRow key={`${row.date}-${row.activity.id}`} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
