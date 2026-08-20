export class SearchValidationError extends Error {
  constructor(public code: string, message: string) {
    super(message)
  }
}

export function validateSearchInput(body: { query?: unknown; maxResults?: unknown; pageToken?: unknown }) {
  const query = typeof body.query === 'string' ? body.query.trim().replace(/\s+/g, ' ') : ''
  const maxResults = body.maxResults === undefined ? 20 : Number(body.maxResults)
  const pageToken = typeof body.pageToken === 'string' ? body.pageToken.trim() : undefined
  if (query.length < 2 || query.length > 100) {
    throw new SearchValidationError('INVALID_QUERY', 'Search must contain between 2 and 100 characters.')
  }
  if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 20) {
    throw new SearchValidationError('INVALID_MAX_RESULTS', 'maxResults must be an integer from 1 to 20.')
  }
  if (body.pageToken !== undefined && (!pageToken || pageToken.length > 500)) {
    throw new SearchValidationError('INVALID_PAGE_TOKEN', 'pageToken must be a non-empty string of at most 500 characters.')
  }
  return { query, maxResults, pageToken }
}
