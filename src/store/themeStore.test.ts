import { beforeEach, describe, expect, it } from 'vitest'
import { useThemeStore } from './themeStore'

beforeEach(() => {
  localStorage.clear()
  useThemeStore.setState({ theme: 'system' })
})

describe('useThemeStore', () => {
  it('starts in system theme', () => {
    expect(useThemeStore.getState().theme).toBe('system')
  })

  it('sets light theme', () => {
    useThemeStore.getState().setTheme('light')

    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('sets dark theme', () => {
    useThemeStore.getState().setTheme('dark')

    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('sets system theme', () => {
    useThemeStore.getState().setTheme('system')

    expect(useThemeStore.getState().theme).toBe('system')
  })
})
