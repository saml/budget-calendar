import { describe, expect, it } from 'vitest'
import type { Budget } from '../types'
import { calcTotalCost, formatNumber } from './budgetUtils'

const base: Budget = {
  id: '1',
  name: 'Trip',
  startDate: '2025-01-01',
  endDate: '2025-01-03',
  categories: [],
  days: [{ date: '2025-01-01', activities: [] }],
}

describe('calcTotalCost', () => {
  it('returns 0 for a budget with no activities', () => {
    expect(calcTotalCost(base)).toBe(0)
  })

  it('ignores activities with no cost', () => {
    const budget = {
      ...base,
      days: [{ date: '2025-01-01', activities: [{ id: 'a', time: '09:00', description: 'Walk' }] }],
    }
    expect(calcTotalCost(budget)).toBe(0)
  })

  it('sums cost × count for activities with a cost', () => {
    const budget = {
      ...base,
      days: [
        {
          date: '2025-01-01',
          activities: [
            { id: 'a', time: '09:00', description: 'Taxi', cost: 20, count: 2 },
            { id: 'b', time: '10:00', description: 'Coffee', cost: 5 },
          ],
        },
      ],
    }
    expect(calcTotalCost(budget)).toBe(45)
  })

  it('sums across multiple days', () => {
    const budget = {
      ...base,
      days: [
        { date: '2025-01-01', activities: [{ id: 'a', time: '09:00', description: 'Taxi', cost: 10 }] },
        { date: '2025-01-02', activities: [{ id: 'b', time: '09:00', description: 'Hotel', cost: 100 }] },
      ],
    }
    expect(calcTotalCost(budget)).toBe(110)
  })
})

describe('formatNumber', () => {
  it('formats a number with locale separators', () => {
    expect(formatNumber(1234.5)).toMatch(/1[,.]?234/)
  })

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})
