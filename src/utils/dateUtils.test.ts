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
      duration: { minutes: 30 },
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

  it('uses total cost when count is present', () => {
    const activity = {
      id: 'activity-2',
      time: '10:00',
      description: 'Taxi',
      cost: 20,
      count: 3,
    }

    expect(toCalendarEvent(activity, '2025-01-04').title).toBe('Taxi (60)')
  })

  it('defaults count to 1 when formatting total cost', () => {
    const activity = {
      id: 'activity-3',
      time: '11:00',
      description: 'Taxi',
      cost: 20,
    }

    expect(toCalendarEvent(activity, '2025-01-04').title).toBe('Taxi (20)')
  })

  it('defaults duration to 30 minutes', () => {
    const activity = {
      id: 'activity-4',
      time: '12:00',
      description: 'Lunch',
    }

    expect(toCalendarEvent(activity, '2025-01-04')).toMatchObject({
      duration: { minutes: 30 },
    })
  })

  it('uses the activity duration when provided', () => {
    const activity = {
      id: 'activity-5',
      time: '13:00',
      description: 'Museum',
      duration: 45,
    }

    expect(toCalendarEvent(activity, '2025-01-04')).toMatchObject({
      duration: { minutes: 45 },
    })
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
