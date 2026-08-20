import type { DisplayCreator } from '../../types/creators'

export function SearchSummary({ creators, resultCount, label = 'creators found' }: { creators: DisplayCreator[]; resultCount: number; label?: string }) {
  const highFit = creators.filter((creator) => creator.overallScore >= 85).length
  const shortlisted = creators.filter((creator) => creator.status === 'shortlisted').length
  const discovered = creators.filter((creator) => creator.status === 'discovered').length
  return (
    <div className="results-summary">
      <p><strong className="font-data">{resultCount}</strong> {label}</p>
      <div><span><i className="signal high" />{highFit} high-fit</span><span>{shortlisted} shortlisted</span><span>{discovered} not reviewed</span></div>
    </div>
  )
}
