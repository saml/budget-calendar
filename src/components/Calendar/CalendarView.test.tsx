import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Budget } from '../../types'
import { CalendarView } from './CalendarView'

const budget: Budget = {
  id: 'budget-1',
  name: 'Trip',
  startDate: '2025-09-01',
  endDate: '2025-09-10',
  categories: [],
  days: [],
}

describe('CalendarView', () => {
  it('renders activities in the calendar', () => {
    render(
      <CalendarView
        budget={{
          ...budget,
          days: [
            {
              date: '2025-09-01',
              activities: [
                {
                  id: 'activity-1',
                  time: '10:00',
                  description: 'Museum',
                },
              ],
            },
          ],
        }}
      />,
    )

    expect(screen.getByText('Museum')).toBeInTheDocument()
  })

  it('renders an Itinerary toolbar button', () => {
    render(<CalendarView budget={budget} />)

    expect(screen.getByText('Itinerary')).toBeInTheDocument()
  })

  it('renders Day and Week toolbar buttons', () => {
    render(<CalendarView budget={budget} />)

    expect(screen.getByText('Day')).toBeInTheDocument()
    expect(screen.getByText('Week')).toBeInTheDocument()
  })
})
