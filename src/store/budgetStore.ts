import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { generateDays } from '../utils/dateUtils'
import type { Activity, Budget } from '../types'

type BudgetStore = {
  budgets: Budget[]
  activeBudgetId: string | null
  addBudget: (budget: Omit<Budget, 'id' | 'days' | 'categories'>) => void
  importBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void
  setActiveBudget: (id: string | null) => void
  addActivity: (date: string, activity: Omit<Activity, 'id'>) => void
  updateActivity: (date: string, activity: Activity) => void
  moveActivity: (fromDate: string, toDate: string, activity: Activity) => void
  deleteActivity: (date: string, activityId: string) => void
  addCategory: (name: string) => void
  deleteCategory: (id: string) => void
}

function randomId() {
  return crypto.randomUUID()
}

function updateActiveBudget(
  budgets: Budget[],
  activeBudgetId: string | null,
  update: (budget: Budget) => Budget,
) {
  return budgets.map((budget) =>
    budget.id === activeBudgetId ? update(budget) : budget,
  )
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      budgets: [],
      activeBudgetId: null,
      addBudget: (budget) =>
        set((state) => ({
          budgets: [
            ...state.budgets,
            {
              id: randomId(),
              ...budget,
              categories: [],
              days: generateDays(budget.startDate, budget.endDate),
            },
          ],
        })),
      importBudget: (budget) =>
        set((state) => {
          const idMap: Record<string, string> = {}
          const categories = budget.categories.map((category) => {
            const id = randomId()
            idMap[category.id] = id
            return { ...category, id }
          })
          const days = budget.days.map((day) => ({
            ...day,
            activities: day.activities.map((activity) => ({
              ...activity,
              id: randomId(),
              categoryId: activity.categoryId ? idMap[activity.categoryId] : undefined,
            })),
          }))

          return {
            budgets: [
              ...state.budgets,
              {
                ...budget,
                id: randomId(),
                categories,
                days,
              },
            ],
          }
        }),
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
          activeBudgetId:
            state.activeBudgetId === id ? null : state.activeBudgetId,
        })),
      setActiveBudget: (id) => set({ activeBudgetId: id }),
      addActivity: (date, activity) =>
        set((state) => ({
          budgets: updateActiveBudget(
            state.budgets,
            state.activeBudgetId,
            (budget) => ({
              ...budget,
              days: budget.days.map((day) =>
                day.date === date
                  ? {
                      ...day,
                      activities: [
                        ...day.activities,
                        { id: randomId(), ...activity },
                      ],
                    }
                  : day,
              ),
            }),
          ),
        })),
      updateActivity: (date, activity) =>
        set((state) => ({
          budgets: updateActiveBudget(
            state.budgets,
            state.activeBudgetId,
            (budget) => ({
              ...budget,
              days: budget.days.map((day) =>
                day.date === date
                  ? {
                      ...day,
                      activities: day.activities.map((existing) =>
                        existing.id === activity.id ? activity : existing,
                      ),
                    }
                  : day,
              ),
            }),
          ),
        })),
      moveActivity: (fromDate, toDate, activity) =>
        set((state) => ({
          budgets: updateActiveBudget(
            state.budgets,
            state.activeBudgetId,
            (budget) => ({
              ...budget,
              days: budget.days.map((day) => {
                if (day.date === fromDate && day.date === toDate) {
                  return {
                    ...day,
                    activities: day.activities.map((existing) =>
                      existing.id === activity.id ? activity : existing,
                    ),
                  }
                }
                if (day.date === fromDate) {
                  return {
                    ...day,
                    activities: day.activities.filter(
                      (existing) => existing.id !== activity.id,
                    ),
                  }
                }
                if (day.date === toDate) {
                  return {
                    ...day,
                    activities: [...day.activities, activity],
                  }
                }
                return day
              }),
            }),
          ),
        })),
      deleteActivity: (date, activityId) =>
        set((state) => ({
          budgets: updateActiveBudget(
            state.budgets,
            state.activeBudgetId,
            (budget) => ({
              ...budget,
              days: budget.days.map((day) =>
                day.date === date
                  ? {
                      ...day,
                      activities: day.activities.filter(
                        (activity) => activity.id !== activityId,
                      ),
                    }
                  : day,
              ),
            }),
          ),
        })),
      addCategory: (name) =>
        set((state) => ({
          budgets: updateActiveBudget(
            state.budgets,
            state.activeBudgetId,
            (budget) => ({
              ...budget,
              categories: [
                ...budget.categories,
                {
                  id: randomId(),
                  name,
                },
              ],
            }),
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          budgets: updateActiveBudget(
            state.budgets,
            state.activeBudgetId,
            (budget) => ({
              ...budget,
              categories: budget.categories.filter(
                (category) => category.id !== id,
              ),
            }),
          ),
        })),
    }),
    {
      name: 'budget-calendar:budgets',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ budgets: state.budgets }),
    },
  ),
)

export type { BudgetStore }
