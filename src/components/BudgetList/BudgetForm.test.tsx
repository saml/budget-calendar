import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { BudgetForm } from './BudgetForm'
import { useBudgetStore } from '../../store/budgetStore'

beforeEach(() => {
  localStorage.clear()
  useBudgetStore.setState({ budgets: [], activeBudgetId: null })
})

describe('BudgetForm', () => {
  it('renders the budget fields', () => {
    render(<BudgetForm />)

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Start date')).toBeInTheDocument()
    expect(screen.getByLabelText('End date')).toBeInTheDocument()
  })

  it('creates a budget from valid input', async () => {
    const user = userEvent.setup()

    render(<BudgetForm />)

    await user.type(screen.getByLabelText('Name'), 'Beach trip')
    await user.type(screen.getByLabelText('Start date'), '2025-06-01')
    await user.type(screen.getByLabelText('End date'), '2025-06-03')
    await user.click(screen.getByRole('button', { name: 'Create budget' }))

    expect(useBudgetStore.getState().budgets[0]).toMatchObject({
      name: 'Beach trip',
      startDate: '2025-06-01',
      endDate: '2025-06-03',
    })
  })

  it('does not submit without a name', async () => {
    const user = userEvent.setup()

    render(<BudgetForm />)

    await user.type(screen.getByLabelText('Start date'), '2025-06-01')
    await user.type(screen.getByLabelText('End date'), '2025-06-03')
    await user.click(screen.getByRole('button', { name: 'Create budget' }))

    expect(useBudgetStore.getState().budgets).toEqual([])
  })

  it('does not submit when endDate is before startDate', async () => {
    const user = userEvent.setup()

    render(<BudgetForm />)

    await user.type(screen.getByLabelText('Name'), 'Bad trip')
    await user.type(screen.getByLabelText('Start date'), '2025-06-10')
    await user.type(screen.getByLabelText('End date'), '2025-06-01')
    await user.click(screen.getByRole('button', { name: 'Create budget' }))

    expect(useBudgetStore.getState().budgets).toEqual([])
  })
})
