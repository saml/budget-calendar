import { useState } from 'react'
import { useBudgetStore } from '../../store/budgetStore'

export function BudgetForm() {
  const addBudget = useBudgetStore((state) => state.addBudget)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currency, setCurrency] = useState('')

  const canSubmit =
    name.trim() !== '' &&
    startDate !== '' &&
    endDate !== '' &&
    endDate >= startDate

  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
      onSubmit={(event) => {
        event.preventDefault()
        if (!canSubmit) return
        addBudget({
          name: name.trim(),
          startDate,
          endDate,
          currency: currency.trim(),
        })
        setName('')
        setStartDate('')
        setEndDate('')
        setCurrency('')
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          aria-label="Name"
          className="w-40 rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Start date
        <input
          aria-label="Start date"
          type="date"
          className="w-36 rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        End date
        <input
          aria-label="End date"
          type="date"
          className="w-36 rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Currency
        <input
          aria-label="Currency"
          className="w-24 rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
        />
      </label>
      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded bg-neutral-900 px-4 py-1.5 text-sm text-white disabled:opacity-40 dark:bg-neutral-50 dark:text-neutral-900"
      >
        Create budget
      </button>
    </form>
  )
}
