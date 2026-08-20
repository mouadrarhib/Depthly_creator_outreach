import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCreators, fetchCreatorVideos, importCreator, updateCreatorCrm } from '../lib/creator-data'
import type { CreatorCandidate, CreatorStatus } from '../types/creators'

export const creatorKeys = {
  all: ['creators'] as const,
  shortlist: ['creators', 'shortlisted'] as const,
  videos: (id: string) => ['creator-videos', id] as const,
}

export function useCreators(status?: CreatorStatus) {
  return useQuery({
    queryKey: status === 'shortlisted' ? creatorKeys.shortlist : creatorKeys.all,
    queryFn: () => fetchCreators(status),
  })
}

export function useCreatorVideos(id?: string) {
  return useQuery({
    queryKey: creatorKeys.videos(id ?? ''),
    queryFn: () => fetchCreatorVideos(id!),
    enabled: Boolean(id),
  })
}

export function useImportCreator() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: importCreator,
    onSuccess: (creator) => {
      client.invalidateQueries({ queryKey: creatorKeys.all })
      client.invalidateQueries({ queryKey: creatorKeys.shortlist })
      client.invalidateQueries({ queryKey: creatorKeys.videos(creator.id) })
    },
  })
}

export function useUpdateCreator() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: {
      id: string
      values: { contactEmail?: string | null; contactUrl?: string | null; notes?: string | null; status?: CreatorStatus }
    }) => updateCreatorCrm(id, values),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: creatorKeys.all })
      client.invalidateQueries({ queryKey: creatorKeys.shortlist })
    },
  })
}

export async function ensureImported(candidate: CreatorCandidate, id?: string) {
  return id ?? (await importCreator(candidate)).id
}
