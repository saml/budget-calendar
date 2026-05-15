import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { useThemeStore } from './store/themeStore'

function mockMatchMedia(matches: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = []
  const mq = {
    matches,
    addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => listeners.push(fn),
    removeEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => {
      const i = listeners.indexOf(fn)
      if (i >= 0) listeners.splice(i, 1)
    },
  }
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn(() => mq),
  })
  return { mq, listeners }
}

beforeEach(() => {
  localStorage.clear()
  useThemeStore.setState({ theme: 'system' })
  document.documentElement.classList.remove('dark')
  vi.restoreAllMocks()
})

describe('App theme effect', () => {
  it('adds the dark class for dark theme', () => {
    useThemeStore.setState({ theme: 'dark' })

    render(<App />)

    expect(document.documentElement).toHaveClass('dark')
  })

  it('removes the dark class for light theme', () => {
    useThemeStore.setState({ theme: 'light' })
    document.documentElement.classList.add('dark')

    render(<App />)

    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('uses system dark preference when theme is system', () => {
    mockMatchMedia(true)

    render(<App />)

    expect(document.documentElement).toHaveClass('dark')
  })

  it('uses system light preference when theme is system', () => {
    mockMatchMedia(false)

    render(<App />)

    expect(document.documentElement).not.toHaveClass('dark')
  })
})
