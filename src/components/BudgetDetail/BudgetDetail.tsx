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
    return <main>Budget not found</main>
  }

  return (
    <main>
      <header>
        <button type="button" onClick={onBack}>
          ← Back
        </button>
        <h1>{budget.name}</h1>
        <p>
          {budget.startDate} → {budget.endDate} · {budget.currency}
        </p>
        <CategoryManager />
      </header>
      <CalendarView budget={budget} />
    </main>
  )
}
