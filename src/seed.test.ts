import { beforeEach, describe, expect, it, vi } from 'vitest'

const { importBudget, sampleBudget } = vi.hoisted(() => ({
  importBudget: vi.fn(),
  sampleBudget: {
    id: 'sample-budget',
    name: 'Sample',
    startDate: '2026-06-01',
    endDate: '2026-06-02',
    categories: [],
    days: [],
  },
}))

vi.mock('./store/budgetStore', () => ({
  useBudgetStore: {
    getState: () => ({ importBudget }),
  },
}))

vi.mock('../example/example.json', () => ({
  default: sampleBudget,
}))

import { seedSampleBudget } from './seed'

describe('seedSampleBudget', () => {
  beforeEach(() => {
    localStorage.clear()
    importBudget.mockReset()
  })

  it('seeds on first visit', () => {
    seedSampleBudget()

    expect(importBudget).toHaveBeenCalledTimes(1)
    expect(importBudget).toHaveBeenCalledWith(sampleBudget)
    expect(localStorage.getItem('budget-calendar:seeded')).toBe('1')
  })

  it('skips if already seeded', () => {
    localStorage.setItem('budget-calendar:seeded', '1')

    seedSampleBudget()

    expect(importBudget).not.toHaveBeenCalled()
  })
})
