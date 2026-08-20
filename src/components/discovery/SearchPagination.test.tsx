import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchPagination } from './SearchPagination'

describe('SearchPagination', () => {
  it('shows page context and moves in either available direction', async () => {
    const user = userEvent.setup()
    const onPrevious = vi.fn()
    const onNext = vi.fn()
    render(<SearchPagination
      page={2}
      resultCount={20}
      estimatedTotalResults={1234}
      hasPrevious
      hasNext
      loading={false}
      onPrevious={onPrevious}
      onNext={onNext}
    />)

    expect(screen.getByText('Page 2')).toBeInTheDocument()
    expect(screen.getByText('20 creators on this page')).toBeInTheDocument()
    expect(screen.getByText('About 1,234 YouTube video results')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Previous creator page' }))
    await user.click(screen.getByRole('button', { name: 'Next creator page' }))
    expect(onPrevious).toHaveBeenCalledOnce()
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('disables unavailable navigation while loading', () => {
    render(<SearchPagination
      page={1}
      resultCount={8}
      estimatedTotalResults={null}
      hasPrevious={false}
      hasNext
      loading
      onPrevious={vi.fn()}
      onNext={vi.fn()}
    />)

    expect(screen.getByRole('button', { name: 'Previous creator page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next creator page' })).toBeDisabled()
  })
})
