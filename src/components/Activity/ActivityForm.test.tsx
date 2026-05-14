import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ActivityForm } from './ActivityForm'
import { useBudgetStore } from '../../store/budgetStore'

beforeEach(() => {
  localStorage.clear()
  useBudgetStore.setState({ budgets: [], activeBudgetId: null })
})

describe('ActivityForm', () => {
  const budget = {
    id: 'budget-1',
    name: 'Trip',
    startDate: '2025-08-01',
    endDate: '2025-08-03',
    currency: 'USD',
    categories: [
      { id: 'cat-1', name: 'Food' },
      { id: 'cat-2', name: 'Transit' },
    ],
    days: [],
  }

  it('renders an empty add form', () => {
    render(<ActivityForm budget={budget} date="2025-08-01" onClose={() => {}} />)

    expect(screen.getByLabelText('Time')).toHaveValue('')
    expect(screen.getByLabelText('Description')).toHaveValue('')
    expect((screen.getByLabelText('Cost') as HTMLInputElement).value).toBe('')
  })

  it('renders an edit form with values', () => {
    render(
      <ActivityForm
        budget={budget}
        date="2025-08-01"
        activity={{
          id: 'activity-1',
          time: '09:00',
          description: 'Breakfast',
          cost: 14,
          categoryId: 'cat-1',
        }}
        onClose={() => {}}
      />,
    )

    expect(screen.getByLabelText('Time')).toHaveValue('09:00')
    expect(screen.getByLabelText('Description')).toHaveValue('Breakfast')
    expect(screen.getByLabelText('Cost')).toHaveValue(14)
    expect(screen.getByLabelText('Category')).toHaveValue('cat-1')
  })

  it('adds an activity from the form', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    useBudgetStore.setState({
      budgets: [{ ...budget, days: [{ date: '2025-08-01', activities: [] }] }],
      activeBudgetId: budget.id,
    })

    render(<ActivityForm budget={budget} date="2025-08-01" onClose={onClose} />)

    await user.type(screen.getByLabelText('Time'), '08:30')
    await user.type(screen.getByLabelText('Description'), 'Coffee')
    await user.clear(screen.getByLabelText('Cost'))
    await user.type(screen.getByLabelText('Cost'), '5')
    await user.click(screen.getByRole('button', { name: 'Add activity' }))

    expect(useBudgetStore.getState().budgets[0].days[0].activities[0]).toMatchObject(
      {
        time: '08:30',
        description: 'Coffee',
        cost: 5,
      },
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('deletes an activity in edit mode', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    useBudgetStore.setState({
      budgets: [{ ...budget, days: [{ date: '2025-08-01', activities: [] }] }],
      activeBudgetId: budget.id,
    })

    render(
      <ActivityForm
        budget={budget}
        date="2025-08-01"
        activity={{
          id: 'activity-1',
          time: '09:00',
          description: 'Breakfast',
        }}
        onClose={onClose}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete activity' }))

    expect(onClose).toHaveBeenCalled()
  })
})
