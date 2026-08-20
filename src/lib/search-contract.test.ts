import { describe, expect, it } from 'vitest'
import { SearchValidationError, validateSearchInput } from '../../supabase/functions/_shared/search-contract'

describe('YouTube search contract', () => {
  it('normalizes a valid request and applies the default result count', () => {
    expect(validateSearchInput({ query: '  study   with me  ' })).toEqual({ query: 'study with me', maxResults: 20, pageToken: undefined })
  })

  it('preserves a valid YouTube page token', () => {
    expect(validateSearchInput({ query: 'study', pageToken: '  CAUQAA  ' })).toEqual({
      query: 'study', maxResults: 20, pageToken: 'CAUQAA',
    })
  })

  it.each([
    [{ query: '' }, 'INVALID_QUERY'],
    [{ query: 'x' }, 'INVALID_QUERY'],
    [{ query: 'study', maxResults: 0 }, 'INVALID_MAX_RESULTS'],
    [{ query: 'study', maxResults: 21 }, 'INVALID_MAX_RESULTS'],
    [{ query: 'study', maxResults: 1.5 }, 'INVALID_MAX_RESULTS'],
    [{ query: 'study', pageToken: '' }, 'INVALID_PAGE_TOKEN'],
    [{ query: 'study', pageToken: 123 }, 'INVALID_PAGE_TOKEN'],
  ])('rejects invalid requests', (input, code) => {
    expect(() => validateSearchInput(input)).toThrow(SearchValidationError)
    try { validateSearchInput(input) } catch (error) { expect((error as SearchValidationError).code).toBe(code) }
  })
})
