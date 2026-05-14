import { describe, expect, it } from 'vitest'
import { budgetDurationDays, generateDays, toCalendarEvent } from './dateUtils'

describe('dateUtils', () => {
  it('generates days for an inclusive date range', () => {
    expect(generateDays('2025-01-01', '2025-01-03')).toEqual([
      { date: '2025-01-01', activities: [] },
      { date: '2025-01-02', activities: [] },
      { date: '2025-01-03', activities: [] },
    ])
  })

  it('generates a single day when start and end match', () => {
    expect(generateDays('2025-01-05', '2025-01-05')).toEqual([
      { date: '2025-01-05', activities: [] },
    ])
  })

  it('generates days correctly regardless of timezone offset', () => {
    const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset
    Date.prototype.getTimezoneOffset = () => -840

    try {
      expect(generateDays('2025-01-01', '2025-01-02')).toEqual([
        { date: '2025-01-01', activities: [] },
        { date: '2025-01-02', activities: [] },
      ])
    } finally {
      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset
    }
  })

  it('maps an activity to a calendar event', () => {
    const activity = {
      id: 'activity-1',
      time: '09:30',
      description: 'Breakfast',
      cost: 12,
      categoryId: 'food',
    }

    expect(toCalendarEvent(activity, '2025-01-02')).toEqual({
      id: 'activity-1',
      start: '2025-01-02T09:30:00',
      title: 'Breakfast (12)',
      extendedProps: {
        activity,
        date: '2025-01-02',
      },
    })
  })

  it('maps an activity without cost to a calendar event with description-only title', () => {
    const activity = { id: 'a1', time: '14:00', description: 'Walk' }

    expect(toCalendarEvent(activity, '2025-01-03').title).toBe('Walk')
  })
})

describe('budgetDurationDays', () => {
  it('returns 1 for a single-day budget', () => {
    expect(budgetDurationDays('2025-01-05', '2025-01-05')).toBe(1)
  })

  it('returns 10 for a 10-day budget', () => {
    expect(budgetDurationDays('2025-01-01', '2025-01-10')).toBe(10)
  })
})
