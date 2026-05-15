import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BudgetList } from './BudgetList'
import { useBudgetStore } from '../../store/budgetStore'

beforeEach(() => {
  localStorage.clear()
  useBudgetStore.setState({ budgets: [], activeBudgetId: null })
})

describe('BudgetList', () => {
  it('renders budgets from the store', () => {
    useBudgetStore.setState({
      budgets: [
        {
          id: 'budget-1',
          name: 'Trip',
          startDate: '2025-07-01',
          endDate: '2025-07-03',
          categories: [],
          days: [],
        },
      ],
    })

    render(<BudgetList onOpen={vi.fn()} />)

    expect(screen.getByText('Trip')).toBeInTheDocument()
    expect(screen.getByText('2025-07-01 → 2025-07-03')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Total Cost' })).toBeInTheDocument()
  })

  it('deletes a budget', async () => {
    const user = userEvent.setup()
    useBudgetStore.setState({
      budgets: [
        {
          id: 'budget-1',
          name: 'Trip',
          startDate: '2025-07-01',
          endDate: '2025-07-03',
          categories: [],
          days: [],
        },
      ],
    })

    render(<BudgetList onOpen={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(useBudgetStore.getState().budgets).toEqual([])
  })

  it('opens a budget and marks it active', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    useBudgetStore.setState({
      budgets: [
        {
          id: 'budget-1',
          name: 'Trip',
          startDate: '2025-07-01',
          endDate: '2025-07-03',
          categories: [],
          days: [],
        },
      ],
    })

    render(<BudgetList onOpen={onOpen} />)

    await user.click(screen.getByRole('button', { name: 'Open' }))

    expect(useBudgetStore.getState().activeBudgetId).toBe('budget-1')
    expect(onOpen).toHaveBeenCalledWith('budget-1')
  })
})
