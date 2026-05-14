import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CalendarView } from './CalendarView'

describe('CalendarView', () => {
  it('renders activities in the calendar', () => {
    render(
      <CalendarView
        budget={{
          id: 'budget-1',
          name: 'Trip',
          startDate: '2025-09-01',
          endDate: '2025-09-07',
          currency: 'USD',
          categories: [],
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
})
