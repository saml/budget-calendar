import { BudgetForm } from './BudgetForm'
import { useBudgetStore } from '../../store/budgetStore'

type BudgetListProps = {
  onOpen: (id: string) => void
}

export function BudgetList({ onOpen }: BudgetListProps) {
  const budgets = useBudgetStore((state) => state.budgets)
  const deleteBudget = useBudgetStore((state) => state.deleteBudget)
  const setActiveBudget = useBudgetStore((state) => state.setActiveBudget)

  return (
    <main>
      <h1>Budgets</h1>
      <BudgetForm />
      <ul>
        {budgets.map((budget) => (
          <li key={budget.id}>
            <div>{budget.name}</div>
            <div>
              {budget.startDate} → {budget.endDate}
            </div>
            <div>{budget.currency}</div>
            <button
              type="button"
              onClick={() => {
                setActiveBudget(budget.id)
                onOpen(budget.id)
              }}
            >
              Open
            </button>
            <button type="button" onClick={() => deleteBudget(budget.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
