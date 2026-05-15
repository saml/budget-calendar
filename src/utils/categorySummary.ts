import type { Budget } from '../types'
import { getCategoryColor } from './dateUtils'

export type CategorySummaryRow = {
  categoryId: string | undefined
  categoryName: string
  totalCost: number
  percentage: number
  count: number
  color: string
}

export function computeCategorySummary(budget: Budget): CategorySummaryRow[] {
  const grouped = new Map<
    string | undefined,
    { categoryName: string; totalCost: number; count: number }
  >()

  for (const category of budget.categories) {
    grouped.set(category.id, { categoryName: category.name, totalCost: 0, count: 0 })
  }

  grouped.set(undefined, {
    categoryName: 'Uncategorized',
    totalCost: 0,
    count: 0,
  })

  for (const day of budget.days) {
    for (const activity of day.activities) {
      const key = grouped.has(activity.categoryId) ? activity.categoryId : undefined
      const current = grouped.get(key)!

      current.count += 1
      if (activity.cost !== undefined) {
        current.totalCost += activity.cost * (activity.count ?? 1)
      }
    }
  }

  const totalCost = Array.from(grouped.values()).reduce((sum, item) => sum + item.totalCost, 0)

  const rows: CategorySummaryRow[] = budget.categories
    .map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      totalCost: grouped.get(category.id)?.totalCost ?? 0,
      count: grouped.get(category.id)?.count ?? 0,
      color: getCategoryColor(budget.categories, category.id) ?? '#9ca3af',
      percentage:
        totalCost === 0
          ? 0
          : Math.round(((grouped.get(category.id)?.totalCost ?? 0) / totalCost) * 1000) / 10,
    }))
    .filter((row) => row.count > 0)

  if (grouped.get(undefined)?.count) {
    rows.push({
      categoryId: undefined,
      categoryName: 'Uncategorized',
      totalCost: grouped.get(undefined)?.totalCost ?? 0,
      count: grouped.get(undefined)?.count ?? 0,
      color: '#9ca3af',
      percentage:
        totalCost === 0
          ? 0
          : Math.round(((grouped.get(undefined)?.totalCost ?? 0) / totalCost) * 1000) / 10,
    })
  }

  return rows
}
