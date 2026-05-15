import { useEffect, useState } from 'react'
import { useBudgetStore } from '../../store/budgetStore'
import { CalendarView } from '../Calendar/CalendarView'
import { ActivityTable } from '../ActivityTable/ActivityTable'
import { CategoryManager } from '../Category/CategoryManager'
import { calcTotalCost, formatNumber } from '../../utils/budgetUtils'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'
import { AnalyticsView } from '../Analytics/AnalyticsView'

type BudgetDetailProps = {
  budgetId: string
  onBack: () => void
}

export function BudgetDetail({ budgetId, onBack }: BudgetDetailProps) {
  const budget = useBudgetStore((state) =>
    state.budgets.find((item) => item.id === budgetId),
  )
  const setActiveBudget = useBudgetStore((state) => state.setActiveBudget)
  const [viewMode, setViewMode] = useState<'calendar' | 'table' | 'analytics'>('calendar')

  useEffect(() => {
    setActiveBudget(budgetId)
    return () => setActiveBudget(null)
  }, [budgetId, setActiveBudget])

  if (!budget) {
    return <main className="p-6">Budget not found</main>
  }

  return (
    <main className="flex h-screen flex-col">
      <header className="flex items-start gap-4 border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <button
          type="button"
          onClick={onBack}
          className="mt-1 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{budget.name}</h1>
          <p className="text-sm text-neutral-500">
            {budget.startDate} → {budget.endDate} ·{' '}
            {formatNumber(calcTotalCost(budget))}
          </p>
          <CategoryManager />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              aria-pressed={viewMode === 'calendar'}
            >
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-pressed={viewMode === 'table'}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('analytics')}
              aria-pressed={viewMode === 'analytics'}
            >
              Analytics
            </button>
          </div>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <div className="flex-1 overflow-auto">
        {viewMode === 'calendar' ? (
          <CalendarView budget={budget} />
        ) : viewMode === 'table' ? (
          <ActivityTable budget={budget} />
        ) : (
          <AnalyticsView budget={budget} />
        )}
      </div>
    </main>
  )
}
