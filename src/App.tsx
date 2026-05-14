import { useState } from 'react'
import { BudgetDetail } from './components/BudgetDetail/BudgetDetail'
import { BudgetList } from './components/BudgetList/BudgetList'

type View =
  | { page: 'list' }
  | { page: 'detail'; budgetId: string }

function App() {
  const [view, setView] = useState<View>({ page: 'list' })

  if (view.page === 'detail') {
    return (
      <BudgetDetail
        budgetId={view.budgetId}
        onBack={() => setView({ page: 'list' })}
      />
    )
  }

  return <BudgetList onOpen={(budgetId) => setView({ page: 'detail', budgetId })} />
}

export default App
