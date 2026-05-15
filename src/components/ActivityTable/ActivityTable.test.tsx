import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ActivityTable } from './ActivityTable'
import type { Budget } from '../../types'

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

describe('ActivityTable', () => {
  it('renders all activities across all days as rows', () => {
    renderTable()

    expect(screen.getAllByRole('row')).toHaveLength(5)
  })

  it('defaults to sorting by date ascending', () => {
    renderTable()

    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.map((row) => within(row).getByText(/2025-/).textContent)).toEqual([
      '2025-06-01 08:00',
      '2025-06-01 14:00',
      '2025-06-02 09:00',
      '2025-06-03 10:00',
    ])
  })

  it('resorts rows by category name with uncategorized last', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByRole('button', { name: 'Sort by category' }))

    const rows = screen.getAllByRole('row').slice(1)
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

    expect(museumCells[0]).toHaveTextContent('Alpha')
    expect(coffeeCells[0]).toHaveTextContent('—')
  })
})
