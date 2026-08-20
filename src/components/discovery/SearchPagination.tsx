import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'

interface SearchPaginationProps {
  page: number
  resultCount: number
  estimatedTotalResults: number | null
  hasPrevious: boolean
  hasNext: boolean
  loading: boolean
  onPrevious: () => void
  onNext: () => void
}

export function SearchPagination({
  page, resultCount, estimatedTotalResults, hasPrevious, hasNext, loading, onPrevious, onNext,
}: SearchPaginationProps) {
  return (
    <nav className="search-pagination" aria-label="Creator search pages">
      <div>
        <strong>Page {page}</strong>
        <span>{resultCount} creator{resultCount === 1 ? '' : 's'} on this page</span>
        {estimatedTotalResults !== null && <span>About {estimatedTotalResults.toLocaleString()} YouTube video results</span>}
      </div>
      <div className="pagination-actions">
        <Button size="sm" onClick={onPrevious} disabled={!hasPrevious || loading} aria-label="Previous creator page">
          <ChevronLeft /> Previous
        </Button>
        <Button size="sm" onClick={onNext} disabled={!hasNext || loading} aria-label="Next creator page">
          Next <ChevronRight />
        </Button>
      </div>
    </nav>
  )
}
