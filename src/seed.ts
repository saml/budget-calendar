import sampleBudget from '../example/example.json'
import type { Budget } from './types'
import { useBudgetStore } from './store/budgetStore'

const SEED_KEY = 'budget-calendar:seeded'

export function seedSampleBudget() {
  if (localStorage.getItem(SEED_KEY)) return

  localStorage.setItem(SEED_KEY, '1')
  useBudgetStore.getState().importBudget(sampleBudget as Budget)
}
