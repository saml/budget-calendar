import { useEffect } from 'react'
import { useBudgetStore } from '../../store/budgetStore'
import { CalendarView } from '../Calendar/CalendarView'
import { CategoryManager } from '../Category/CategoryManager'

type BudgetDetailProps = {
  budgetId: string
  onBack: () => void
}

export function BudgetDetail({ budgetId, onBack }: BudgetDetailProps) {
  const budget = useBudgetStore((state) =>
    state.budgets.find((item) => item.id === budgetId),
  )
  const setActiveBudget = useBudgetStore((state) => state.setActiveBudget)

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
          {budget.startDate} → {budget.endDate} · {budget.currency}
          </p>
          <CategoryManager />
        </div>
      </header>
      <div className="flex-1 overflow-auto">
        <CalendarView budget={budget} />
      </div>
    </main>
  )
}
