import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ActivityTable } from './ActivityTable'
import type { Budget } from '../../types'

const updateActivity = vi.fn()

vi.mock('../../store/budgetStore', () => ({
  useBudgetStore: (selector: (state: { updateActivity: typeof updateActivity }) => unknown) =>
    selector({ updateActivity }),
}))

const budget: Budget = {
  id: 'budget-1',
  name: 'Trip',
  startDate: '2025-06-01',
  endDate: '2025-06-03',
  categories: [
    { id: 'cat-alpha', name: 'Alpha' },
    { id: 'cat-beta', name: 'Beta' },
  ],
  days: [
    {
      date: '2025-06-02',
      activities: [
        {
          id: 'activity-3',
          time: '09:00',
          description: 'Breakfast',
          cost: 5,
          count: 2,
          categoryId: 'cat-beta',
        },
      ],
    },
    {
      date: '2025-06-01',
      activities: [
        {
          id: 'activity-1',
          time: '14:00',
          description: 'Museum',
          cost: 20,
          categoryId: 'cat-alpha',
        },
        {
          id: 'activity-2',
          time: '08:00',
          description: 'Coffee',
        },
      ],
    },
    {
      date: '2025-06-03',
      activities: [
        {
          id: 'activity-4',
          time: '10:00',
          description: 'Zoo',
          cost: 10,
          count: 3,
          categoryId: 'cat-beta',
        },
      ],
    },
  ],
}

function renderTable() {
  return render(<ActivityTable budget={budget} />)
}

beforeEach(() => {
  updateActivity.mockClear()
})

describe('ActivityTable', () => {
  it('renders all activities across all days as rows', () => {
    renderTable()

    expect(screen.getAllByRole('row')).toHaveLength(11)
  })

  it('groups activities by category with subtotals', () => {
    renderTable()

    expect(screen.getByRole('button', { name: 'Sort by datetime' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Group by category' })).not.toBeInTheDocument()

    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Alpha')
    expect(rows[2]).toHaveTextContent('Museum')
    expect(rows[3]).toHaveTextContent('Alpha subtotal')
    expect(rows[4]).toHaveTextContent('Beta')
    expect(rows[5]).toHaveTextContent('Breakfast')
    expect(rows[6]).toHaveTextContent('Zoo')
    expect(rows[7]).toHaveTextContent('Beta subtotal')
    expect(rows[8]).toHaveTextContent('Uncategorized')
    expect(rows[9]).toHaveTextContent('Coffee')
    expect(rows[10]).toHaveTextContent('Uncategorized subtotal')
  })

  it('shows a "Sort by datetime" button in grouped mode', () => {
    renderTable()

    expect(screen.getByRole('button', { name: 'Sort by datetime' })).toBeInTheDocument()
  })

  it('sorts all activities by datetime when flat mode is active', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByRole('button', { name: 'Sort by datetime' }))

    const rows = screen.getAllByRole('row')
    expect(rows.slice(1).every((row) => within(row).queryAllByRole('columnheader').length === 0)).toBe(
      true,
    )
    expect(
      rows.filter((row) => within(row).queryByText(/2025-/)).map((row) =>
        within(row).getByText(/2025-/).textContent,
      ),
    ).toEqual([
      '2025-06-01 08:00',
      '2025-06-01 14:00',
      '2025-06-02 09:00',
      '2025-06-03 10:00',
    ])
  })

  it('shows only activity rows in flat mode', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByRole('button', { name: 'Sort by datetime' }))

    expect(screen.getAllByRole('row')).toHaveLength(5)
  })

  it('returns to grouped mode when "Group by category" is clicked', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByRole('button', { name: 'Sort by datetime' }))
    await user.click(screen.getByRole('button', { name: 'Group by category' }))

    expect(screen.getAllByRole('row')).toHaveLength(11)
  })

  it('sorts activities by date within each category group', () => {
    renderTable()

    const rows = screen.getAllByRole('row').filter((row) => within(row).queryByText(/2025-/))
    expect(rows.map((row) => within(row).getByText(/2025-/).textContent)).toEqual([
      '2025-06-01 14:00',
      '2025-06-02 09:00',
      '2025-06-03 10:00',
      '2025-06-01 08:00',
    ])
  })

  it('shows total price as cost × count when cost is present and an em dash when absent', () => {
    renderTable()

    const breakfastRow = screen.getByText('Breakfast').closest('tr')
    const coffeeRow = screen.getByText('Coffee').closest('tr')
    const breakfastCells = within(breakfastRow!).getAllByRole('cell')
    const coffeeCells = within(coffeeRow!).getAllByRole('cell')

    expect(breakfastCells[5]).toHaveTextContent('10')
    expect(coffeeCells[5]).toHaveTextContent('—')
  })

  it('shows the category name or an em dash when uncategorized', () => {
    renderTable()

    const museumRow = screen.getByText('Museum').closest('tr')
    const coffeeRow = screen.getByText('Coffee').closest('tr')
    const museumCells = within(museumRow!).getAllByRole('cell')
    const coffeeCells = within(coffeeRow!).getAllByRole('cell')

    expect(museumCells[1]).toHaveTextContent('Alpha')
    expect(coffeeCells[1]).toHaveTextContent('—')
  })

  it('activates a text input when description cell is clicked', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByText('Museum'))

    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument()
  })

  it('saves description on blur', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByText('Museum'))
    const input = screen.getByDisplayValue('Museum')
    await user.clear(input)
    await user.type(input, 'Aquarium')
    await user.tab()

    expect(updateActivity).toHaveBeenCalledWith(
      '2025-06-01',
      expect.objectContaining({ id: 'activity-1', description: 'Aquarium' }),
    )
  })

  it('saves description on Enter', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByText('Museum'))
    const input = screen.getByDisplayValue('Museum')
    await user.clear(input)
    await user.type(input, 'Aquarium{Enter}')

    expect(updateActivity).toHaveBeenCalledWith(
      '2025-06-01',
      expect.objectContaining({ description: 'Aquarium' }),
    )
  })

  it('cancels edit on Escape without saving', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByText('Museum'))
    const input = screen.getByDisplayValue('Museum')
    await user.clear(input)
    await user.type(input, 'Aquarium')
    await user.keyboard('{Escape}')

    expect(updateActivity).not.toHaveBeenCalled()
    expect(screen.getByText('Museum')).toBeInTheDocument()
  })

  it('shows a select when category cell is clicked', async () => {
    const user = userEvent.setup()
    renderTable()

    const museumRow = screen.getByText('Museum').closest('tr')!
    const categoryCell = within(museumRow).getAllByRole('cell')[1]
    await user.click(categoryCell)

    expect(within(museumRow).getByRole('combobox')).toBeInTheDocument()
  })

  it('saves category on blur', async () => {
    const user = userEvent.setup()
    renderTable()

    const museumRow = screen.getByText('Museum').closest('tr')!
    const categoryCell = within(museumRow).getAllByRole('cell')[1]
    await user.click(categoryCell)
    const select = within(museumRow).getByRole('combobox')
    await user.selectOptions(select, 'cat-beta')
    await user.tab()

    expect(updateActivity).toHaveBeenCalledWith(
      '2025-06-01',
      expect.objectContaining({ categoryId: 'cat-beta' }),
    )
  })

  it('activates cost input when cost cell is clicked', async () => {
    const user = userEvent.setup()
    renderTable()

    const museumRow = screen.getByText('Museum').closest('tr')!
    const costCell = within(museumRow).getAllByRole('cell')[4]
    await user.click(costCell)

    expect(within(museumRow).getByRole('spinbutton')).toBeInTheDocument()
  })

  it('activates count input when count cell is clicked', async () => {
    const user = userEvent.setup()
    renderTable()

    const breakfastRow = screen.getByText('Breakfast').closest('tr')!
    const countCell = within(breakfastRow).getAllByRole('cell')[3]
    await user.click(countCell)

    expect(within(breakfastRow).getByRole('spinbutton')).toBeInTheDocument()
  })
})
