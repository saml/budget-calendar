import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AnalyticsView } from './AnalyticsView'
import type { Budget } from '../../types'
import { getCategoryColor } from '../../utils/dateUtils'

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
      date: '2025-06-01',
      activities: [
        { id: 'a1', time: '09:00', description: 'Breakfast', cost: 10, categoryId: 'cat-beta' },
        { id: 'a2', time: '12:00', description: 'Museum', cost: 20, categoryId: 'cat-alpha' },
      ],
    },
    {
      date: '2025-06-02',
      activities: [{ id: 'a3', time: '08:00', description: 'Coffee', cost: 5 }],
    },
  ],
}

describe('AnalyticsView', () => {
  it('renders a pie chart and legend for each category summary', () => {
    const { container } = render(
      <div style={{ width: 600, height: 400 }}>
        <AnalyticsView budget={budget} />
      </div>,
    )

    expect(container.querySelectorAll('.recharts-sector')).toHaveLength(3)
    expect(container.querySelector('.recharts-sector')).toHaveAttribute(
      'fill',
      getCategoryColor(budget.categories, 'cat-alpha'),
    )

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('Uncategorized')).toBeInTheDocument()
    expect(screen.getByText('57.1%')).toBeInTheDocument()
    expect(screen.getByText('28.6%')).toBeInTheDocument()
    expect(screen.getByText('14.3%')).toBeInTheDocument()
  })

  it('shows an empty message when there are no activities', () => {
    render(
      <AnalyticsView
        budget={{
          ...budget,
          days: [{ date: '2025-06-01', activities: [] }],
        }}
      />,
    )

    expect(screen.getByText('No activities yet')).toBeInTheDocument()
  })
})
