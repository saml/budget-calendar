import type { EventInput } from '@fullcalendar/core'
import type { Activity, Day } from '../types'

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
  return activity.cost === undefined
    ? activity.description
    : `${activity.description} (${activity.cost})`
}

export function budgetDurationDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
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

export function toCalendarEvent(activity: Activity, date: string): EventInput {
  return {
    id: activity.id,
    start: `${date}T${activity.time}:00`,
    title: formatTitle(activity),
    extendedProps: {
      activity,
      date,
    },
  }
}
