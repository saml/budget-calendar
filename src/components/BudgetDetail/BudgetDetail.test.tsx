import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BudgetDetail } from './BudgetDetail'
import { useBudgetStore } from '../../store/budgetStore'

beforeEach(() => {
  localStorage.clear()
  useBudgetStore.setState({ budgets: [], activeBudgetId: null })
})

describe('BudgetDetail', () => {
  const budget = {
    id: 'budget-1',
    name: 'Trip',
    startDate: '2025-10-01',
    endDate: '2025-10-05',
    categories: [],
    days: [],
  }

  const budgetWithActivity = {
    ...budget,
    days: [
      {
        date: '2025-10-01',
        activities: [
          {
            id: 'activity-1',
            time: '09:00',
            description: 'Breakfast',
            cost: 10,
            categoryId: 'cat-alpha',
          },
        ],
      },
    ],
    categories: [{ id: 'cat-alpha', name: 'Alpha' }],
  }

  it('sets the active budget on mount and clears it on unmount', () => {
    useBudgetStore.setState({ budgets: [budget] })
    const { unmount } = render(<BudgetDetail budgetId={budget.id} onBack={vi.fn()} />)

    expect(useBudgetStore.getState().activeBudgetId).toBe(budget.id)

    unmount()

    expect(useBudgetStore.getState().activeBudgetId).toBeNull()
  })

  it('renders the budget header and back button', () => {
    useBudgetStore.setState({ budgets: [budget] })
    const onBack = vi.fn()

    render(<BudgetDetail budgetId={budget.id} onBack={onBack} />)

    expect(screen.getByText('Trip')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '← Back' })).toBeInTheDocument()
    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === '2025-10-01 → 2025-10-05 · 0',
      ),
    ).toBeInTheDocument()
  })

  it('renders calendar, table, and analytics view toggle buttons', () => {
    useBudgetStore.setState({ budgets: [budget] })

    render(<BudgetDetail budgetId={budget.id} onBack={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Calendar' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Table' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Analytics' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches between calendar, table, and analytics views', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    useBudgetStore.setState({ budgets: [budgetWithActivity] })

    render(<BudgetDetail budgetId={budgetWithActivity.id} onBack={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Table' }))

    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0)
    expect(screen.getByText('Alpha subtotal')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Analytics' }))

    expect(screen.getAllByText('Alpha').length).toBeGreaterThan(0)
    expect(screen.getByText('100.0%')).toBeInTheDocument()
  })

  it('calls back when the back button is clicked', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    useBudgetStore.setState({ budgets: [budget] })
    const onBack = vi.fn()

    render(<BudgetDetail budgetId={budget.id} onBack={onBack} />)

    await user.click(screen.getByRole('button', { name: '← Back' }))

    expect(onBack).toHaveBeenCalled()
  })
})
