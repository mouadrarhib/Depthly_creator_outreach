import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('submits a normalized user-entered search', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    await user.type(screen.getByLabelText('Search query'), '  study with me  ')
    await user.click(screen.getByRole('button', { name: 'Search YouTube' }))
    expect(onSearch).toHaveBeenCalledWith('study with me')
  })

  it('runs a suggested search directly', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)
    await user.click(screen.getByRole('button', { name: 'pomodoro' }))
    expect(onSearch).toHaveBeenCalledWith('pomodoro')
  })
})
