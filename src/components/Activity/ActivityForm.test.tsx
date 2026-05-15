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
    expect(screen.getByLabelText('Duration')).toHaveValue(30)
    expect(screen.queryByLabelText('Count')).not.toBeInTheDocument()
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
    expect(screen.getByLabelText('Duration')).toHaveValue(30)
    expect(screen.getByLabelText('Count')).toHaveValue(1)
    expect(screen.getByLabelText('Category')).toHaveValue('cat-1')
  })

  it('pre-fills time from initialValues when no activity prop', () => {
    render(
      <ActivityForm
        budget={budget}
        date="2025-08-01"
        initialValues={{ time: '14:30' }}
        onClose={() => {}}
      />,
    )

    expect(screen.getByLabelText('Time')).toHaveValue('14:30')
  })

  it('pre-fills all fields from initialValues for copy-paste', () => {
    render(
      <ActivityForm
        budget={budget}
        date="2025-08-01"
        initialValues={{
          time: '09:00',
          description: 'Breakfast',
          cost: 14,
          count: 2,
          duration: 45,
          categoryId: 'cat-1',
        }}
        onClose={() => {}}
      />,
    )

    expect(screen.getByLabelText('Time')).toHaveValue('09:00')
    expect(screen.getByLabelText('Description')).toHaveValue('Breakfast')
    expect(screen.getByLabelText('Cost')).toHaveValue(14)
    expect(screen.getByLabelText('Duration')).toHaveValue(45)
    expect(screen.getByLabelText('Count')).toHaveValue(2)
    expect(screen.getByLabelText('Category')).toHaveValue('cat-1')
  })

  it('initialValues is ignored when activity prop is present (edit mode)', () => {
    render(
      <ActivityForm
        budget={budget}
        date="2025-08-01"
        activity={{ id: 'a1', time: '09:00', description: 'Existing' }}
        initialValues={{ time: '14:00', description: 'Should be ignored' }}
        onClose={() => {}}
      />,
    )

    expect(screen.getByLabelText('Time')).toHaveValue('09:00')
    expect(screen.getByLabelText('Description')).toHaveValue('Existing')
  })

  it('renders a duration field for edit mode values', () => {
    render(
      <ActivityForm
        budget={budget}
        date="2025-08-01"
        activity={{
          id: 'activity-1',
          time: '09:00',
          description: 'Breakfast',
          duration: 45,
        }}
        onClose={() => {}}
      />,
    )

    expect(screen.getByLabelText('Duration')).toHaveValue(45)
  })

  it('pre-fills count from activity in edit mode', () => {
    render(
      <ActivityForm
        budget={budget}
        date="2025-08-01"
        activity={{
          id: 'activity-1',
          time: '09:00',
          description: 'Breakfast',
          cost: 14,
          count: 3,
        }}
        onClose={() => {}}
      />,
    )

    expect(screen.getByLabelText('Count')).toHaveValue(3)
  })

  it('shows count when cost is set', () => {
    render(
      <ActivityForm
        budget={budget}
        date="2025-08-01"
        activity={{
          id: 'activity-1',
          time: '09:00',
          description: 'Breakfast',
          cost: 14,
        }}
        onClose={() => {}}
      />,
    )

    expect(screen.getByLabelText('Count')).toHaveValue(1)
  })

  it('hides count when cost is empty', async () => {
    const user = userEvent.setup()

    render(<ActivityForm budget={budget} date="2025-08-01" onClose={() => {}} />)

    expect(screen.queryByLabelText('Count')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Cost'), '5')
    expect(screen.getByLabelText('Count')).toHaveValue(1)
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
    await user.clear(screen.getByLabelText('Duration'))
    await user.type(screen.getByLabelText('Duration'), '45')
    await user.clear(screen.getByLabelText('Count'))
    await user.type(screen.getByLabelText('Count'), '3')
    await user.click(screen.getByRole('button', { name: 'Add activity' }))

    expect(useBudgetStore.getState().budgets[0].days[0].activities[0]).toMatchObject(
      {
        time: '08:30',
        description: 'Coffee',
        cost: 5,
        count: 3,
        duration: 45,
      },
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('passes duration to the store when adding an activity', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    useBudgetStore.setState({
      budgets: [{ ...budget, days: [{ date: '2025-08-01', activities: [] }] }],
      activeBudgetId: budget.id,
    })

    render(<ActivityForm budget={budget} date="2025-08-01" onClose={onClose} />)

    await user.type(screen.getByLabelText('Time'), '08:30')
    await user.type(screen.getByLabelText('Description'), 'Coffee')
    await user.clear(screen.getByLabelText('Duration'))
    await user.type(screen.getByLabelText('Duration'), '45')
    await user.click(screen.getByRole('button', { name: 'Add activity' }))

    expect(useBudgetStore.getState().budgets[0].days[0].activities[0]).toMatchObject({
      duration: 45,
    })
  })

  it('passes count to the store when cost is set', async () => {
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
    await user.clear(screen.getByLabelText('Count'))
    await user.type(screen.getByLabelText('Count'), '3')
    await user.click(screen.getByRole('button', { name: 'Add activity' }))

    expect(useBudgetStore.getState().budgets[0].days[0].activities[0]).toMatchObject({
      cost: 5,
      count: 3,
    })
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
