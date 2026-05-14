import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBudgetStore } from './budgetStore'

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
        currency: 'JPY',
      })
    })

    expect(result.current.budgets).toHaveLength(1)
    expect(result.current.budgets[0]).toMatchObject({
      name: 'Tokyo',
      startDate: '2025-01-01',
      endDate: '2025-01-03',
      currency: 'JPY',
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
        currency: 'EUR',
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
        currency: 'EUR',
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

  it('adds and deletes categories on the active budget', () => {
    const { result } = renderHook(() => useBudgetStore())

    act(() => {
      result.current.addBudget({
        name: 'Lisbon',
        startDate: '2025-04-01',
        endDate: '2025-04-01',
        currency: 'EUR',
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
        currency: 'KRW',
      })
    })

    expect(setItemSpy).toHaveBeenCalledWith(
      'budget-calendar:budgets',
      expect.any(String),
    )
  })
})
