import { AlertTriangle, Search } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { CreatorDrawer } from '../components/creators/CreatorDrawer'
import { CreatorTable } from '../components/creators/CreatorTable'
import { DEFAULT_FILTERS, DiscoveryFilters } from '../components/discovery/DiscoveryFilters'
import { SearchBar } from '../components/discovery/SearchBar'
import { SearchPagination } from '../components/discovery/SearchPagination'
import { SearchSummary } from '../components/discovery/SearchSummary'
import { Button } from '../components/ui/Button'
import { CreatorSearchError, useCreatorSearch } from '../hooks/useCreatorSearch'
import { useCreators } from '../hooks/useCreators'
import { mergeCandidate } from '../lib/creator-data'
import type { CreatorCandidate, CreatorSearchResponse, CreatorSort, DiscoveryFilters as FilterType, DisplayCreator } from '../types/creators'

function filteredAndSorted(creators: DisplayCreator[], filters: FilterType, sort: CreatorSort) {
  const cutoff = filters.uploadedWithinDays ? Date.now() - filters.uploadedWithinDays * 86_400_000 : null
  return creators.filter((creator) => {
    if (filters.minimumSubscribers !== null && (creator.subscriberCount === null || creator.subscriberCount < filters.minimumSubscribers)) return false
    if (filters.maximumSubscribers !== null && (creator.subscriberCount === null || creator.subscriberCount > filters.maximumSubscribers)) return false
    if (filters.minimumAverageViews !== null && (creator.averageRecentViews ?? 0) < filters.minimumAverageViews) return false
    if (filters.language !== 'all' && creator.language !== filters.language) return false
    if (filters.country !== 'all' && creator.country !== filters.country) return false
    if (cutoff && (!creator.lastUploadAt || new Date(creator.lastUploadAt).getTime() < cutoff)) return false
    if (filters.minimumOverallScore !== null && creator.overallScore < filters.minimumOverallScore) return false
    if (filters.status !== 'all' && creator.status !== filters.status) return false
    return true
  }).sort((a, b) => {
    if (sort === 'views') return (b.averageRecentViews ?? -1) - (a.averageRecentViews ?? -1)
    if (sort === 'subscribers') return (b.subscriberCount ?? -1) - (a.subscriberCount ?? -1)
    if (sort === 'engagement') return (b.engagementRate ?? -1) - (a.engagementRate ?? -1)
    if (sort === 'newest') return new Date(b.lastUploadAt ?? 0).getTime() - new Date(a.lastUploadAt ?? 0).getTime()
    return b.overallScore - a.overallScore
  })
}

export function DiscoveryPage() {
  const search = useCreatorSearch()
  const saved = useCreators()
  const [results, setResults] = useState<CreatorSearchResponse | null>(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sort, setSort] = useState<CreatorSort>('overall')
  const [selected, setSelected] = useState<DisplayCreator | null>(null)
  const [page, setPage] = useState(1)
  const [pageTokens, setPageTokens] = useState<(string | undefined)[]>([undefined])
  const lastRequest = useRef<{ query: string; page: number; token?: string } | null>(null)

  const merged = useMemo(() => {
    const byChannel = new Map((saved.data ?? []).map((creator) => [creator.youtubeChannelId, creator]))
    return (results?.creators ?? []).map((candidate) => mergeCandidate(candidate, byChannel.get(candidate.youtubeChannelId)))
  }, [results, saved.data])
  const visible = useMemo(() => filteredAndSorted(merged, filters, sort), [merged, filters, sort])
  const languages = [...new Set(merged.map((creator) => creator.language).filter((value): value is string => Boolean(value)))].sort()
  const countries = [...new Set(merged.map((creator) => creator.country).filter((value): value is string => Boolean(value)))].sort()

  const fetchPage = (query: string, targetPage: number, pageToken?: string, reset = false) => {
    lastRequest.current = { query, page: targetPage, token: pageToken }
    search.mutate({ query, pageToken }, {
      onSuccess: (response) => {
        setResults(response)
        setPage(targetPage)
        if (reset) setPageTokens([undefined])
      },
    })
  }
  const runSearch = (query: string) => fetchPage(query, 1, undefined, true)
  const nextPage = () => {
    if (!results?.nextPageToken) return
    const token = results.nextPageToken
    const targetPage = page + 1
    setPageTokens((current) => {
      const next = current.slice(0, targetPage - 1)
      next[targetPage - 1] = token
      return next
    })
    fetchPage(results.query, targetPage, token)
  }
  const previousPage = () => {
    if (!results || page <= 1) return
    const targetPage = page - 1
    fetchPage(results.query, targetPage, pageTokens[targetPage - 1])
  }
  const retrySearch = () => {
    const request = lastRequest.current
    if (request) fetchPage(request.query, request.page, request.token, request.page === 1)
  }
  const updateCandidate = (updated: CreatorCandidate) => {
    setResults((current) => current ? { ...current, creators: current.creators.map((creator) => creator.youtubeChannelId === updated.youtubeChannelId ? updated : creator) } : current)
    setSelected((current) => current?.youtubeChannelId === updated.youtubeChannelId ? mergeCandidate(updated, saved.data?.find((item) => item.youtubeChannelId === updated.youtubeChannelId)) : current)
  }

  return (
    <div className="page-stack">
      <SearchBar onSearch={runSearch} loading={search.isPending} initialQuery={results?.query} />
      {results && <DiscoveryFilters filters={filters} onChange={setFilters} sort={sort} onSort={setSort} languages={languages} countries={countries} />}
      {search.isError && <div className="error-state" role="alert"><AlertTriangle /><div><strong>{search.error.message}</strong><span>{search.error instanceof CreatorSearchError && search.error.code === 'YOUTUBE_QUOTA' ? 'Wait for quota reset or use saved creators in Shortlist.' : 'Check the query and try again.'}</span></div><Button size="sm" onClick={retrySearch}>Retry</Button></div>}
      {!results && !search.isPending && <section className="discovery-empty"><div className="empty-icon"><Search /></div><p className="eyebrow">Start with an audience signal</p><h2>Search YouTube to discover creators.</h2><p>Try “study with me”, “student productivity”, or “pomodoro”. Results stay temporary until you save a creator.</p></section>}
      {(results || search.isPending) && <>
        <SearchSummary creators={merged} resultCount={visible.length} label="creators on this page" />
        <CreatorTable creators={visible} onSelect={setSelected} loading={search.isPending} emptyMessage="No creators match these filters. Reset a filter or try another search." />
        {results && <SearchPagination page={page} resultCount={results.creators.length} estimatedTotalResults={results.estimatedTotalResults} hasPrevious={page > 1} hasNext={Boolean(results.nextPageToken)} loading={search.isPending} onPrevious={previousPage} onNext={nextPage} />}
        {results && <p className="sync-note">Last search {new Date(results.searchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · YouTube remains the source of truth for live metrics.</p>}
      </>}
      <CreatorDrawer creator={selected} onClose={() => setSelected(null)} onRefreshed={updateCandidate} />
    </div>
  )
}

export { filteredAndSorted }
