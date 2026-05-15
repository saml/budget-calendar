import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImportButton } from './ImportButton'

const importBudget = vi.fn()

vi.mock('../../store/budgetStore', () => ({
  useBudgetStore: (selector: (state: { importBudget: typeof importBudget }) => unknown) =>
    selector({ importBudget }),
}))

class MockFileReader {
  result: string | ArrayBuffer | null = null
  onload: null | ((event: ProgressEvent<FileReader>) => void) = null

  readAsText(file: File) {
    void file.text().then((text) => {
      this.result = text
      this.onload?.({} as ProgressEvent<FileReader>)
    })
  }
}

beforeEach(() => {
  importBudget.mockReset()
  globalThis.FileReader = MockFileReader as unknown as typeof FileReader
})

describe('ImportButton', () => {
  it('shows error when JSON is invalid', async () => {
    const user = userEvent.setup()
    render(<ImportButton />)

    await user.upload(
      screen.getByLabelText('Import budget file', { selector: 'input' }),
      new File(['not json'], 'bad.json', { type: 'application/json' }),
    )

    expect(await screen.findByText(/Unexpected token|Import failed/)).toBeInTheDocument()
  })

  it('calls importBudget on valid file', async () => {
    const user = userEvent.setup()
    render(<ImportButton />)

    await user.upload(
      screen.getByLabelText('Import budget file', { selector: 'input' }),
      new File(
        [
          JSON.stringify({
            id: 'x',
            name: 'Paris',
            startDate: '2026-06-01',
            endDate: '2026-06-05',
            categories: [],
            days: [],
          }),
        ],
        'paris.json',
        { type: 'application/json' },
      ),
    )

    await waitFor(() => expect(importBudget).toHaveBeenCalled())
  })
})
