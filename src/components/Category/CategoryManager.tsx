import { useBudgetStore } from '../../store/budgetStore'
import { useState } from 'react'

export function CategoryManager() {
  const budget = useBudgetStore((state) =>
    state.budgets.find((item) => item.id === state.activeBudgetId),
  )
  const addCategory = useBudgetStore((state) => state.addCategory)
  const deleteCategory = useBudgetStore((state) => state.deleteCategory)
  const [name, setName] = useState('')

  if (!budget) return null

  return (
    <section>
      <ul>
        {budget.categories.map((category) => (
          <li key={category.id}>
            {category.name}
            <button type="button" onClick={() => deleteCategory(category.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim()) return
          addCategory(name.trim())
          setName('')
        }}
      >
        <input
          aria-label="Category name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit">Add</button>
      </form>
    </section>
  )
}
