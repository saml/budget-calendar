import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CategoryManager } from './CategoryManager'
import { useBudgetStore } from '../../store/budgetStore'

beforeEach(() => {
  localStorage.clear()
  useBudgetStore.setState({ budgets: [], activeBudgetId: null })
})

describe('CategoryManager', () => {
  const budget = {
    id: 'budget-1',
    name: 'Trip',
    startDate: '2025-11-01',
    endDate: '2025-11-03',
    currency: 'USD',
    categories: [
      { id: 'cat-1', name: 'Food' },
      { id: 'cat-2', name: 'Transit' },
    ],
    days: [],
  }

  it('renders existing categories', async () => {
    const user = userEvent.setup()
    useBudgetStore.setState({ budgets: [budget], activeBudgetId: budget.id })

    render(<CategoryManager />)

    await user.click(screen.getByRole('button', { name: /Categories/ }))

    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Transit')).toBeInTheDocument()
  })

  it('adds a category', async () => {
    const user = userEvent.setup()
    useBudgetStore.setState({ budgets: [budget], activeBudgetId: budget.id })

    render(<CategoryManager />)

    await user.click(screen.getByRole('button', { name: /Categories/ }))
    await user.type(screen.getByLabelText('Category name'), 'Lodging')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(useBudgetStore.getState().budgets[0].categories[2].name).toBe('Lodging')
  })

  it('deletes a category', async () => {
    const user = userEvent.setup()
    useBudgetStore.setState({ budgets: [budget], activeBudgetId: budget.id })

    render(<CategoryManager />)

    await user.click(screen.getByRole('button', { name: /Categories/ }))
    await user.click(screen.getAllByRole('button', { name: /Delete category/i })[0])

    expect(useBudgetStore.getState().budgets[0].categories).toEqual([
      { id: 'cat-2', name: 'Transit' },
    ])
  })

  it('is collapsed by default and hides the category list', () => {
    useBudgetStore.setState({ budgets: [budget], activeBudgetId: budget.id })

    render(<CategoryManager />)

    expect(screen.queryByText('Food')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Category name')).not.toBeInTheDocument()
  })

  it('expands when toggle button is clicked', async () => {
    const user = userEvent.setup()
    useBudgetStore.setState({ budgets: [budget], activeBudgetId: budget.id })

    render(<CategoryManager />)

    await user.click(screen.getByRole('button', { name: /Categories/ }))

    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByLabelText('Category name')).toBeInTheDocument()
  })
})
