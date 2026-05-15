import { useThemeStore, type Theme } from '../../store/themeStore'

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: '☀️ Light' },
  { value: 'dark', label: '🌙 Dark' },
  { value: 'system', label: '💻 System' },
]

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  return (
    <div className="flex gap-1" role="group" aria-label="Theme">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            theme === value
              ? 'bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900'
              : 'border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
