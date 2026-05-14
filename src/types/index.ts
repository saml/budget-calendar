export type Category = {
  id: string
  name: string
}

export type Activity = {
  id: string
  time: string
  description: string
  cost?: number
  categoryId?: string
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
  currency: string
  categories: Category[]
  days: Day[]
}
