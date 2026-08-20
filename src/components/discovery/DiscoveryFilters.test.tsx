import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_FILTERS, DiscoveryFilters } from './DiscoveryFilters'

describe('DiscoveryFilters', () => {
  it('exposes the collapsible mobile filter controls and reports active filters', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DiscoveryFilters
      filters={{ ...DEFAULT_FILTERS, minimumSubscribers: 1000 }}
      onChange={onChange}
      sort="overall"
      onSort={vi.fn()}
      languages={['en']}
      countries={['US']}
    />)

    const toggle = screen.getByRole('button', { name: /^filters, 1 active/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('1')).toBeInTheDocument()
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('button', { name: 'Reset filters' }))
    expect(onChange).toHaveBeenCalledWith(DEFAULT_FILTERS)
  })
})
