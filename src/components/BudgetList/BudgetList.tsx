import { BudgetForm } from './BudgetForm'
import { ImportButton } from './ImportButton'
import { useBudgetStore } from '../../store/budgetStore'
import { calcTotalCost, formatNumber } from '../../utils/budgetUtils'
import { exportBudget } from '../../utils/importExport'

type BudgetListProps = {
  onOpen: (id: string) => void
}

export function BudgetList({ onOpen }: BudgetListProps) {
  const budgets = useBudgetStore((state) => state.budgets)
  const deleteBudget = useBudgetStore((state) => state.deleteBudget)
  const setActiveBudget = useBudgetStore((state) => state.setActiveBudget)

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Budgets</h1>
      <BudgetForm />
      <div className="mt-4">
        <ImportButton />
      </div>
      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-700">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Dates</th>
            <th className="py-2 pr-4">Total Cost</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {budgets.length === 0 ? (
            <tr className="border-b border-neutral-100 dark:border-neutral-800">
              <td className="py-3 text-neutral-500" colSpan={4}>
                No budgets yet.
              </td>
            </tr>
          ) : (
            budgets.map((budget) => (
              <tr
                key={budget.id}
                className="border-b border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
              >
                <td className="py-3 pr-4 font-medium">{budget.name}</td>
                <td className="py-3 pr-4 text-neutral-500">
                  {budget.startDate} → {budget.endDate}
                </td>
                <td className="py-3 pr-4 text-neutral-500">
                  {formatNumber(calcTotalCost(budget))}
                </td>
                <td className="flex justify-end gap-2 py-3">
                  <button
                    type="button"
                    onClick={() => exportBudget(budget)}
                    className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveBudget(budget.id)
                      onOpen(budget.id)
                    }}
                    className="rounded bg-neutral-900 px-3 py-1 text-sm text-white hover:opacity-80 dark:bg-neutral-50 dark:text-neutral-900"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteBudget(budget.id)}
                    className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  )
}
