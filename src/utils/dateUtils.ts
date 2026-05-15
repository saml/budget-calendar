import type { EventInput } from '@fullcalendar/core'
import type { Activity, Category, Day } from '../types'

export const CATEGORY_COLORS = [
  '#4f86c6',
  '#e06c4a',
  '#56a35a',
  '#b84f9e',
  '#e0c24a',
  '#4ac0b8',
  '#e04a68',
  '#8b6de0',
  '#7da85a',
  '#e0874a',
]

function toDate(date: string) {
  return new Date(`${date}T00:00:00`)
}

function toIsoDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTitle(activity: Activity) {
  if (activity.cost === undefined) return activity.description
  const total = activity.cost * (activity.count ?? 1)
  return `${activity.description} (${total})`
}

export function budgetDurationDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export function getCategoryColor(categories: Category[], categoryId?: string): string | undefined {
  if (!categoryId) return undefined
  const index = categories.findIndex((category) => category.id === categoryId)
  if (index === -1) return undefined
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

export function generateDays(startDate: string, endDate: string): Day[] {
  const days: Day[] = []
  const current = toDate(startDate)
  const end = toDate(endDate)

  while (current <= end) {
    days.push({ date: toIsoDate(current), activities: [] })
    current.setDate(current.getDate() + 1)
  }

  return days
}

export function toCalendarEvent(
  activity: Activity,
  date: string,
  backgroundColor?: string,
): EventInput {
  const event: EventInput = {
    id: activity.id,
    start: `${date}T${activity.time}:00`,
    duration: { minutes: activity.duration ?? 30 },
    title: formatTitle(activity),
    extendedProps: {
      activity,
      date,
    },
  }
  if (backgroundColor) event.backgroundColor = backgroundColor
  return event
}
