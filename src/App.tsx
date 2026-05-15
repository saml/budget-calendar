import { useEffect, useState } from 'react'
import { BudgetDetail } from './components/BudgetDetail/BudgetDetail'
import { BudgetList } from './components/BudgetList/BudgetList'
import { useThemeStore } from './store/themeStore'

type View =
  | { page: 'list' }
  | { page: 'detail'; budgetId: string }

function useThemeEffect() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
      return
    }
    if (theme === 'light') {
      root.classList.remove('dark')
      return
    }

    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) {
      root.classList.remove('dark')
      return
    }

    const apply = (e: MediaQueryList | MediaQueryListEvent) => {
      root.classList.toggle('dark', e.matches)
    }

    apply(mq)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
}

function App() {
  useThemeEffect()
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
