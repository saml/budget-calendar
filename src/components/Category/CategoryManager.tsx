import { useBudgetStore } from '../../store/budgetStore'
import { useState } from 'react'

export function CategoryManager() {
  const budget = useBudgetStore((state) =>
    state.budgets.find((item) => item.id === state.activeBudgetId),
  )
  const addCategory = useBudgetStore((state) => state.addCategory)
  const deleteCategory = useBudgetStore((state) => state.deleteCategory)
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)

  if (!budget) return null

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        Categories {open ? '▲' : '▼'}
      </button>
      {open ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {budget.categories.map((category) => (
            <span
              key={category.id}
              className="flex items-center gap-1 rounded-full bg-neutral-200 px-2 py-0.5 text-sm dark:bg-neutral-700"
            >
              {category.name}
              <button
                type="button"
                onClick={() => deleteCategory(category.id)}
                aria-label={`Delete category ${category.name}`}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                ✕
              </button>
            </span>
          ))}
          <form
            className="flex gap-1"
            onSubmit={(event) => {
              event.preventDefault()
              if (!name.trim()) return
              addCategory(name.trim())
              setName('')
            }}
          >
            <input
              aria-label="Category name"
              className="w-28 rounded border border-neutral-300 bg-white px-2 py-0.5 text-sm dark:border-neutral-600 dark:bg-neutral-800"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button
              type="submit"
              className="rounded bg-neutral-200 px-2 py-0.5 text-sm hover:opacity-80 dark:bg-neutral-700"
            >
              Add
            </button>
          </form>
        </div>
      ) : null}
    </section>
  )
}
