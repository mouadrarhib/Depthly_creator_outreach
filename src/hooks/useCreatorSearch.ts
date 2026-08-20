import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CreatorSearchResponse } from '../types/creators'

export class CreatorSearchError extends Error {
  constructor(public code: string, message: string) {
    super(message)
  }
}

export function useCreatorSearch() {
  const queryClient = useQueryClient()
  const request = async (query: string, maxResults: number, pageToken?: string) => {
    const { data, error } = await supabase.functions.invoke<CreatorSearchResponse>('youtube-creator-search', {
      body: { query, maxResults, ...(pageToken ? { pageToken } : {}) },
    })
    if (error) {
      let code = 'SEARCH_FAILED'
      let message = error.message || 'Search failed. Try again.'
      const context = error.context as Response | undefined
      if (context?.clone) {
        try {
          const payload = await context.clone().json()
          code = payload.code ?? code
          message = payload.message ?? message
        } catch { /* use the client error */ }
      }
      throw new CreatorSearchError(code, message)
    }
    if (!data) throw new CreatorSearchError('EMPTY_RESPONSE', 'YouTube returned an empty response.')
    return data
  }

  return useMutation({
    mutationKey: ['youtube-search'],
    mutationFn: async ({ query, maxResults = 20, pageToken, force = false }: { query: string; maxResults?: number; pageToken?: string; force?: boolean }) => {
      const normalized = query.trim().replace(/\s+/g, ' ')
      if (force) return request(normalized, maxResults, pageToken)
      return queryClient.fetchQuery({
        queryKey: ['youtube-search', normalized.toLowerCase(), maxResults, pageToken ?? 'first'],
        queryFn: () => request(normalized, maxResults, pageToken),
        staleTime: 10 * 60 * 1000,
      })
    },
  })
}
