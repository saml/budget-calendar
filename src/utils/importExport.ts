import type { Activity, Budget, Category, Day } from '../types'

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function parseBudget(raw: unknown): Budget {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid JSON: expected an object')
  const obj = raw as Record<string, unknown>

  if (typeof obj.name !== 'string' || !obj.name) throw new Error('Missing name')
  if (typeof obj.startDate !== 'string') throw new Error('Missing startDate')
  if (typeof obj.endDate !== 'string') throw new Error('Missing endDate')

  const categories: Category[] = []
  if (Array.isArray(obj.categories)) {
    for (const cat of obj.categories) {
      if (!cat || typeof cat !== 'object') continue
      const candidate = cat as Record<string, unknown>
      if (typeof candidate.name !== 'string') continue
      categories.push({
        id: typeof candidate.id === 'string' ? candidate.id : '',
        name: candidate.name,
      })
    }
  }

  const days: Day[] = []
  if (Array.isArray(obj.days)) {
    for (const day of obj.days) {
      if (!day || typeof day !== 'object') continue
      const candidate = day as Record<string, unknown>
      if (typeof candidate.date !== 'string') continue

      const activities: Activity[] = []
      if (Array.isArray(candidate.activities)) {
        for (const activity of candidate.activities) {
          if (!activity || typeof activity !== 'object') continue
          const candidateActivity = activity as Record<string, unknown>
          if (typeof candidateActivity.time !== 'string') continue
          if (typeof candidateActivity.description !== 'string') continue

          const parsedActivity: Activity = {
            id: typeof candidateActivity.id === 'string' ? candidateActivity.id : '',
            time: candidateActivity.time,
            description: candidateActivity.description,
          }
          if (typeof candidateActivity.cost === 'number') parsedActivity.cost = candidateActivity.cost
          if (typeof candidateActivity.count === 'number') parsedActivity.count = candidateActivity.count
          if (typeof candidateActivity.categoryId === 'string') {
            parsedActivity.categoryId = candidateActivity.categoryId
          }
          if (typeof candidateActivity.duration === 'number') {
            parsedActivity.duration = candidateActivity.duration
          }
          activities.push(parsedActivity)
        }
      }

      days.push({ date: candidate.date, activities })
    }
  }

  return {
    id: typeof obj.id === 'string' ? obj.id : '',
    name: obj.name,
    startDate: obj.startDate,
    endDate: obj.endDate,
    categories,
    days,
  }
}

export function exportBudget(budget: Budget): void {
  const json = JSON.stringify(budget, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${slugify(budget.name)}.json`
  link.click()
  URL.revokeObjectURL(url)
}
