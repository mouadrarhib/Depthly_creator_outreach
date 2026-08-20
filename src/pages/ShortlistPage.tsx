import { AlertTriangle, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CreatorDrawer } from '../components/creators/CreatorDrawer'
import { CreatorTable } from '../components/creators/CreatorTable'
import { SearchSummary } from '../components/discovery/SearchSummary'
import { useCreators } from '../hooks/useCreators'
import { persistedToDisplay } from '../lib/creator-data'
import type { DisplayCreator } from '../types/creators'

export function ShortlistPage() {
  const query = useCreators('shortlisted')
  const creators = useMemo(() => (query.data ?? []).map((creator) => persistedToDisplay(creator)), [query.data])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = creators.find((creator) => creator.id === selectedId) ?? null

  return (
    <div className="page-stack shortlist-page">
      {query.isError && <div className="error-state"><AlertTriangle /><div><strong>Could not load the shortlist.</strong><span>{query.error.message}</span></div></div>}
      {!query.isLoading && !creators.length && !query.isError ? <section className="discovery-empty shortlist-empty"><div className="empty-icon"><Star /></div><p className="eyebrow">Focused outreach starts here</p><h2>No shortlisted creators yet.</h2><p>Shortlist strong candidates from Discovery and they will appear here.</p></section> : <>
        <SearchSummary creators={creators} resultCount={creators.length} label="shortlisted creators" />
        <CreatorTable creators={creators} onSelect={(creator: DisplayCreator) => setSelectedId(creator.id ?? null)} loading={query.isLoading} />
      </>}
      <CreatorDrawer creator={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
