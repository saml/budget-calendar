import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useBudgetStore } from '../../store/budgetStore'
import { parseBudget } from '../../utils/importExport'

export function ImportButton() {
  const importBudget = useBudgetStore((state) => state.importBudget)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string)
        importBudget(parseBudget(json))
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Import failed')
      }
      event.target.value = ''
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        aria-label="Import budget file"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
      >
        Import
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
