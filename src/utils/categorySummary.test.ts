import { describe, expect, it } from 'vitest'
import { computeCategorySummary } from './categorySummary'
import type { Budget } from '../types'
import { calcTotalCost } from './budgetUtils'
import { getCategoryColor } from './dateUtils'

describe('computeCategorySummary', () => {
  it('summarizes category costs and uncategorized activities', () => {
    const budget: Budget = {
      id: 'budget-1',
      name: 'Trip',
      startDate: '2025-06-01',
      endDate: '2025-06-02',
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

    expect(computeCategorySummary(budget)).toEqual([
      {
        categoryId: 'cat-alpha',
        categoryName: 'Alpha',
        totalCost: 20,
        percentage: 57.1,
        count: 1,
        color: getCategoryColor(budget.categories, 'cat-alpha')!,
      },
      {
        categoryId: 'cat-beta',
        categoryName: 'Beta',
        totalCost: 10,
        percentage: 28.6,
        count: 1,
        color: getCategoryColor(budget.categories, 'cat-beta')!,
      },
      {
        categoryId: undefined,
        categoryName: 'Uncategorized',
        totalCost: 5,
        percentage: 14.3,
        count: 1,
        color: '#9ca3af',
      },
    ])
  })

  it('percentages sum to 100', () => {
    const budget: Budget = {
      id: 'budget-1',
      name: 'Trip',
      startDate: '2025-06-01',
      endDate: '2025-06-02',
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

    const rows = computeCategorySummary(budget)
    const sum = rows.reduce((acc, row) => acc + row.percentage, 0)
    expect(Math.round(sum * 10) / 10).toBe(100)
  })

  it('total cost matches calcTotalCost', () => {
    const budget: Budget = {
      id: 'budget-1',
      name: 'Trip',
      startDate: '2025-06-01',
      endDate: '2025-06-02',
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

    const rows = computeCategorySummary(budget)
    const sum = rows.reduce((acc, row) => acc + row.totalCost, 0)
    expect(sum).toBe(calcTotalCost(budget))
  })

  it('treats orphaned category ids as uncategorized', () => {
    const budget: Budget = {
      id: 'budget-1',
      name: 'Trip',
      startDate: '2025-06-01',
      endDate: '2025-06-01',
      categories: [{ id: 'cat-alpha', name: 'Alpha' }],
      days: [
        {
          date: '2025-06-01',
          activities: [
            { id: 'a1', time: '09:00', description: 'Breakfast', cost: 10, categoryId: 'missing' },
          ],
        },
      ],
    }

    expect(computeCategorySummary(budget)).toEqual([
      {
        categoryId: undefined,
        categoryName: 'Uncategorized',
        totalCost: 10,
        percentage: 100,
        count: 1,
        color: '#9ca3af',
      },
    ])
  })
})
