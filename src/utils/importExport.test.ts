import { describe, expect, it, vi } from 'vitest'
import type { Budget } from '../types'
import { exportBudget, parseBudget, slugify } from './importExport'

describe('slugify', () => {
  it('slugifies names for filenames', () => {
    expect(slugify('My Trip!')).toBe('my-trip')
    expect(slugify('Paris 2026')).toBe('paris-2026')
    expect(slugify('  spaces  ')).toBe('spaces')
  })
})

describe('parseBudget', () => {
  it('parses a valid budget and ignores extra fields', () => {
    const raw = {
      id: 'x',
      name: 'Paris',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      categories: [{ id: 'c1', name: 'Food' }],
      days: [
        {
          date: '2026-06-01',
          activities: [
            {
              id: 'a1',
              time: '09:00',
              description: 'Breakfast',
              cost: 15,
              extraField: 'ignored',
            },
          ],
        },
      ],
      extraField: 'ignored',
    }

    const result = parseBudget(raw)

    expect(result).toMatchObject({
      id: 'x',
      name: 'Paris',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      categories: [{ id: 'c1', name: 'Food' }],
      days: [
        {
          date: '2026-06-01',
          activities: [{ id: 'a1', time: '09:00', description: 'Breakfast', cost: 15 }],
        },
      ],
    })
    expect((result as Budget & { extraField?: string }).extraField).toBeUndefined()
  })

  it('throws on missing required fields', () => {
    expect(() => parseBudget({})).toThrow('Missing name')
    expect(() => parseBudget({ name: 'Paris' })).toThrow('Missing startDate')
    expect(() => parseBudget({ name: 'Paris', startDate: '2026-06-01' })).toThrow('Missing endDate')
  })

  it('skips invalid nested items', () => {
    const raw = {
      id: 'x',
      name: 'Paris',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      categories: [null, { id: 'c1', name: 'Food' }],
      days: [
        {
          date: '2026-06-01',
          activities: [null, { id: 'a1', time: '09:00', description: 'Breakfast' }],
        },
      ],
    }

    const result = parseBudget(raw)

    expect(result.categories).toHaveLength(1)
    expect(result.days[0].activities).toHaveLength(1)
  })
})

describe('exportBudget', () => {
  it('triggers a download with the slugified filename', () => {
    const budget: Budget = {
      id: 'x',
      name: 'My Trip',
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      categories: [],
      days: [],
    }

    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      click: vi.fn(),
      set href(value: string) {
        ;(this as HTMLAnchorElement & { hrefValue?: string }).hrefValue = value
      },
      get href() {
        return ''
      },
      set download(value: string) {
        ;(this as HTMLAnchorElement & { downloadValue?: string }).downloadValue = value
      },
      get download() {
        return ''
      },
    } as unknown as HTMLAnchorElement)
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:budget')
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    exportBudget(budget)

    const anchor = createElementSpy.mock.results[0]?.value as HTMLAnchorElement & {
      downloadValue?: string
      click: ReturnType<typeof vi.fn>
    }

    expect(anchor.downloadValue).toBe('my-trip.json')
    expect(anchor.click).toHaveBeenCalled()
    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:budget')
  })
})
