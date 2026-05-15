export type Category = {
  id: string
  name: string
}

export type Activity = {
  id: string
  time: string
  description: string
  cost?: number
  count?: number
  categoryId?: string
  duration?: number
}

export type Day = {
  date: string
  activities: Activity[]
}

export type Budget = {
  id: string
  name: string
  startDate: string
  endDate: string
  categories: Category[]
  days: Day[]
}
