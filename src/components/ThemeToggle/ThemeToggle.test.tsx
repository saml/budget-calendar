import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeToggle } from './ThemeToggle'
import { useThemeStore } from '../../store/themeStore'

beforeEach(() => {
  localStorage.clear()
  useThemeStore.setState({ theme: 'system' })
})

describe('ThemeToggle', () => {
  it('renders the theme buttons', () => {
    render(<ThemeToggle />)

    expect(screen.getByRole('button', { name: '☀️ Light' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '🌙 Dark' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '💻 System' })).toBeInTheDocument()
  })

  it('marks the active theme button', () => {
    useThemeStore.setState({ theme: 'dark' })

    render(<ThemeToggle />)

    expect(screen.getByRole('button', { name: '🌙 Dark' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '☀️ Light' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: '💻 System' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('sets light, dark, and system themes', async () => {
    const user = userEvent.setup()

    render(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: '☀️ Light' }))
    expect(useThemeStore.getState().theme).toBe('light')

    await user.click(screen.getByRole('button', { name: '🌙 Dark' }))
    expect(useThemeStore.getState().theme).toBe('dark')

    await user.click(screen.getByRole('button', { name: '💻 System' }))
    expect(useThemeStore.getState().theme).toBe('system')
  })
})
