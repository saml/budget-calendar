import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBudgetStore } from './budgetStore'
import type { Budget } from '../types'

beforeEach(() => {
  localStorage.clear()
  useBudgetStore.setState({ budgets: [], activeBudgetId: null })
  vi.restoreAllMocks()
})

describe('useBudgetStore', () => {
  it('adds a budget with generated days', () => {
    const { result } = renderHook(() => useBudgetStore())

    act(() => {
      result.current.addBudget({
        name: 'Tokyo',
        startDate: '2025-01-01',
        endDate: '2025-01-03',
      })
    })

    expect(result.current.budgets).toHaveLength(1)
    expect(result.current.budgets[0]).toMatchObject({
      name: 'Tokyo',
      startDate: '2025-01-01',
      endDate: '2025-01-03',
    })
    expect(result.current.budgets[0].days).toEqual([
      { date: '2025-01-01', activities: [] },
      { date: '2025-01-02', activities: [] },
      { date: '2025-01-03', activities: [] },
    ])
  })

  it('deletes a budget', () => {
    const { result } = renderHook(() => useBudgetStore())

    act(() => {
      result.current.addBudget({
        name: 'Paris',
        startDate: '2025-02-01',
        endDate: '2025-02-02',
      })
    })

    const id = result.current.budgets[0].id

    act(() => {
      result.current.deleteBudget(id)
    })

    expect(result.current.budgets).toEqual([])
  })

  it('adds, updates, and deletes activities on the active budget', () => {
    const { result } = renderHook(() => useBudgetStore())

    act(() => {
      result.current.addBudget({
        name: 'Rome',
        startDate: '2025-03-01',
        endDate: '2025-03-01',
      })
    })

    const budgetId = result.current.budgets[0].id

    act(() => {
      result.current.setActiveBudget(budgetId)
      result.current.addActivity('2025-03-01', {
        time: '08:00',
        description: 'Breakfast',
        cost: 10,
      })
    })

    const activity = result.current.budgets[0].days[0].activities[0]
    expect(activity).toMatchObject({
      time: '08:00',
      description: 'Breakfast',
      cost: 10,
    })

    act(() => {
      result.current.updateActivity('2025-03-01', {
        ...activity,
        description: 'Hotel breakfast',
      })
    })

    expect(result.current.budgets[0].days[0].activities[0]).toMatchObject({
      id: activity.id,
      description: 'Hotel breakfast',
    })

    act(() => {
      result.current.deleteActivity('2025-03-01', activity.id)
    })

    expect(result.current.budgets[0].days[0].activities).toEqual([])
  })

  it('moveActivity: moves an activity to a different day with a new time', () => {
    const { result } = renderHook(() => useBudgetStore())

    act(() => {
      result.current.addBudget({
        name: 'Madrid',
        startDate: '2025-03-01',
        endDate: '2025-03-02',
      })
    })

    const budgetId = result.current.budgets[0].id

    act(() => {
      result.current.setActiveBudget(budgetId)
      result.current.addActivity('2025-03-01', {
        time: '08:00',
        description: 'Breakfast',
      })
    })

    const activity = result.current.budgets[0].days[0].activities[0]

    act(() => {
      result.current.moveActivity('2025-03-01', '2025-03-02', {
        ...activity,
        time: '14:00',
      })
    })

    expect(result.current.budgets[0].days[0].activities).toEqual([])
    expect(result.current.budgets[0].days[1].activities).toEqual([
      {
        ...activity,
        time: '14:00',
      },
    ])
  })

  it('moveActivity: updates time when moved within the same day', () => {
    const { result } = renderHook(() => useBudgetStore())

    act(() => {
      result.current.addBudget({
        name: 'Madrid',
        startDate: '2025-03-01',
        endDate: '2025-03-01',
      })
    })

    const budgetId = result.current.budgets[0].id

    act(() => {
      result.current.setActiveBudget(budgetId)
      result.current.addActivity('2025-03-01', {
        time: '08:00',
        description: 'Breakfast',
      })
    })

    const activity = result.current.budgets[0].days[0].activities[0]

    act(() => {
      result.current.moveActivity('2025-03-01', '2025-03-01', {
        ...activity,
        time: '10:00',
      })
    })

    expect(result.current.budgets[0].days[0].activities).toEqual([
      {
        ...activity,
        time: '10:00',
      },
    ])
  })

  it('adds and deletes categories on the active budget', () => {
    const { result } = renderHook(() => useBudgetStore())

    act(() => {
      result.current.addBudget({
        name: 'Lisbon',
        startDate: '2025-04-01',
        endDate: '2025-04-01',
      })
    })

    const budgetId = result.current.budgets[0].id

    act(() => {
      result.current.setActiveBudget(budgetId)
      result.current.addCategory('Food')
    })

    const category = result.current.budgets[0].categories[0]
    expect(category.name).toBe('Food')

    act(() => {
      result.current.deleteCategory(category.id)
    })

    expect(result.current.budgets[0].categories).toEqual([])
  })

  it('persists budgets to localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
    const { result } = renderHook(() => useBudgetStore())

    act(() => {
      result.current.addBudget({
        name: 'Seoul',
        startDate: '2025-05-01',
        endDate: '2025-05-01',
      })
    })

    expect(setItemSpy).toHaveBeenCalledWith(
      'budget-calendar:budgets',
      expect.any(String),
    )
  })

  it('adds imported budget with fresh IDs', () => {
    const budget: Budget = {
      id: 'old-id',
      name: 'Paris',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      categories: [{ id: 'old-cat', name: 'Food' }],
      days: [
        {
          date: '2026-06-01',
          activities: [
            {
              id: 'old-act',
              time: '09:00',
              description: 'Breakfast',
              categoryId: 'old-cat',
            },
          ],
        },
      ],
    }

    act(() => {
      useBudgetStore.getState().importBudget(budget)
    })

    const imported = useBudgetStore.getState().budgets[0]
    const actv = imported.days[0].activities[0]

    expect(imported.id).not.toBe('old-id')
    expect(imported.categories[0].id).not.toBe('old-cat')
    expect(actv.id).not.toBe('old-act')
    expect(actv.categoryId).toBe(imported.categories[0].id)
  })

  it('handles budget with no categories or activities', () => {
    const budget: Budget = {
      id: 'x',
      name: 'Empty',
      startDate: '2026-01-01',
      endDate: '2026-01-01',
      categories: [],
      days: [{ date: '2026-01-01', activities: [] }],
    }

    act(() => {
      useBudgetStore.getState().importBudget(budget)
    })

    expect(useBudgetStore.getState().budgets).toHaveLength(1)
  })
})
