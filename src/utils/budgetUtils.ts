import type { Budget } from '../types'

export function calcTotalCost(budget: Budget): number {
  return budget.days
    .flatMap((day) => day.activities)
    .reduce((sum, activity) => {
      if (activity.cost === undefined) return sum
      return sum + activity.cost * (activity.count ?? 1)
    }, 0)
}

export function formatNumber(amount: number): string {
  return amount.toLocaleString()
}
