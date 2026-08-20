import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/utils'
import type { CreatorSort, DiscoveryFilters } from '../../types/creators'

export const DEFAULT_FILTERS: DiscoveryFilters = {
  minimumSubscribers: null,
  maximumSubscribers: null,
  minimumAverageViews: null,
  language: 'all',
  country: 'all',
  uploadedWithinDays: null,
  minimumOverallScore: null,
  status: 'all',
}

const numeric = (value: string) => value === '' ? null : Number(value)

export function DiscoveryFilters({ filters, onChange, sort, onSort, languages, countries }: {
  filters: DiscoveryFilters
  onChange: (filters: DiscoveryFilters) => void
  sort: CreatorSort
  onSort: (sort: CreatorSort) => void
  languages: string[]
  countries: string[]
}) {
  const [open, setOpen] = useState(false)
  const set = <K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) => onChange({ ...filters, [key]: value })
  const activeCount = Object.entries(filters).filter(([key, value]) => key !== 'status' ? value !== null && value !== 'all' : value !== 'all').length
  const sortLabel = sort === 'overall' ? 'Overall score' : sort
  return (
    <section className={cn('filter-bar', open && 'filters-open')} aria-label="Creator filters">
      <button className="mobile-filter-toggle" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-controls="creator-filter-fields" aria-label={`Filters, ${activeCount} active, sort ${sortLabel}`}>
        <span><SlidersHorizontal size={15} /> Filters {activeCount > 0 && <b>{activeCount}</b>}</span>
        <span>Sort: {sortLabel}<ChevronDown size={15} /></span>
      </button>
      <div className="filter-fields" id="creator-filter-fields">
        <label><span>Min subscribers</span><input type="number" min="0" inputMode="numeric" placeholder="Any" value={filters.minimumSubscribers ?? ''} onChange={(e) => set('minimumSubscribers', numeric(e.target.value))} /></label>
        <label><span>Max subscribers</span><input type="number" min="0" inputMode="numeric" placeholder="Any" value={filters.maximumSubscribers ?? ''} onChange={(e) => set('maximumSubscribers', numeric(e.target.value))} /></label>
        <label><span>Min avg views</span><input type="number" min="0" inputMode="numeric" placeholder="Any" value={filters.minimumAverageViews ?? ''} onChange={(e) => set('minimumAverageViews', numeric(e.target.value))} /></label>
        <label><span>Language</span><select value={filters.language} onChange={(e) => set('language', e.target.value)}><option value="all">All</option>{languages.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Country</span><select value={filters.country} onChange={(e) => set('country', e.target.value)}><option value="all">All</option>{countries.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label><span>Last upload</span><select value={filters.uploadedWithinDays ?? ''} onChange={(e) => set('uploadedWithinDays', numeric(e.target.value))}><option value="">Any time</option><option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option></select></label>
        <label><span>Min score</span><select value={filters.minimumOverallScore ?? ''} onChange={(e) => set('minimumOverallScore', numeric(e.target.value))}><option value="">Any</option><option value="70">70+</option><option value="85">85+</option></select></label>
        <label><span>Status</span><select value={filters.status} onChange={(e) => set('status', e.target.value as DiscoveryFilters['status'])}><option value="all">All</option><option value="discovered">Discovered</option><option value="shortlisted">Shortlisted</option><option value="contacted">Contacted</option><option value="replied">Replied</option><option value="negotiating">Negotiating</option><option value="partnered">Partnered</option><option value="rejected">Rejected</option></select></label>
        <label className="sort-control"><span>Sort by</span><select value={sort} onChange={(e) => onSort(e.target.value as CreatorSort)}><option value="overall">Overall score</option><option value="views">Average views</option><option value="subscribers">Subscribers</option><option value="engagement">Engagement</option><option value="newest">Newest upload</option></select></label>
        <button className="reset-filters" onClick={() => onChange(DEFAULT_FILTERS)} aria-label="Reset filters"><RotateCcw size={14} /><span>Reset</span></button>
      </div>
    </section>
  )
}
