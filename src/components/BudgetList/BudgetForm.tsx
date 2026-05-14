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
      <label>
        Name
        <input
          aria-label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label>
        Start date
        <input
          aria-label="Start date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      </label>
      <label>
        End date
        <input
          aria-label="End date"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </label>
      <label>
        Currency
        <input
          aria-label="Currency"
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
        />
      </label>
      <button type="submit">Create budget</button>
    </form>
  )
}
