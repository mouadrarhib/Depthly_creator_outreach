import { ChevronRight, Link2, Mail } from 'lucide-react'
import { cn, formatCompact, formatPercent, relativeDate } from '../../lib/utils'
import type { DisplayCreator } from '../../types/creators'

const statusLabels: Record<DisplayCreator['status'], string> = {
  discovered: 'Discovered', shortlisted: 'Shortlisted', contacted: 'Contacted', replied: 'Replied',
  negotiating: 'Negotiating', partnered: 'Partnered', rejected: 'Rejected',
}

function Score({ value }: { value: number }) {
  const strength = value >= 85 ? 'strong' : value >= 70 ? 'medium' : 'weak'
  return <span className={cn('score-cell', strength)}><span className="fit-rail"><i style={{ height: `${value}%` }} /></span><strong>{value}</strong></span>
}

function Avatar({ creator }: { creator: DisplayCreator }) {
  if (creator.thumbnailUrl) return <img src={creator.thumbnailUrl} alt="" />
  return <span>{creator.channelName.slice(0, 1).toUpperCase()}</span>
}

export function CreatorTable({ creators, onSelect, loading = false, emptyMessage }: {
  creators: DisplayCreator[]
  onSelect: (creator: DisplayCreator) => void
  loading?: boolean
  emptyMessage?: string
}) {
  return (
    <div className="creator-table-wrap">
      <table className="creator-table">
        <thead><tr><th>Creator</th><th>Subscribers</th><th>Avg views</th><th>Engagement</th><th>Last upload</th><th>Niche</th><th>Overall</th><th>Contact</th><th>Status</th><th><span className="sr-only">Open</span></th></tr></thead>
        <tbody>
          {loading ? Array.from({ length: 9 }, (_, index) => <tr className="skeleton-row" key={index}><td colSpan={10}><span /></td></tr>) : creators.map((creator) => (
            <tr key={creator.youtubeChannelId} tabIndex={0} onClick={() => onSelect(creator)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(creator) }}>
              <td><div className="creator-identity"><div className="avatar"><Avatar creator={creator} /></div><div><strong>{creator.channelName}</strong><small>{creator.language ?? 'Language unknown'} · {creator.isSaved ? 'Saved' : 'Not saved'}</small></div></div></td>
              <td className="font-data">{formatCompact(creator.subscriberCount)}</td>
              <td className="font-data">{formatCompact(creator.averageRecentViews)}</td>
              <td className="font-data">{formatPercent(creator.engagementRate)}</td>
              <td className="font-data muted-data">{relativeDate(creator.lastUploadAt)}</td>
              <td className="font-data">{creator.nicheScore}</td>
              <td><Score value={creator.overallScore} /></td>
              <td><span className={cn('contact-indicator', (creator.contactEmail || creator.contactUrl) && 'available')} title={creator.contactEmail ? 'Email saved' : creator.contactUrl ? 'Contact link saved' : 'No contact saved'}>{creator.contactEmail ? <Mail size={14} /> : <Link2 size={14} />}</span></td>
              <td><span className={cn('status-pill', `status-${creator.status}`)}>{statusLabels[creator.status]}</span></td>
              <td><ChevronRight className="row-chevron" size={16} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="creator-card-list" aria-label="Creator results">
        {loading ? Array.from({ length: 6 }, (_, index) => <div className="creator-card creator-card-skeleton" key={index}><span /><span /><span /></div>) : creators.map((creator) => (
          <button className="creator-card" type="button" key={creator.youtubeChannelId} onClick={() => onSelect(creator)}>
            <span className="creator-card-head">
              <span className="creator-identity"><span className="avatar"><Avatar creator={creator} /></span><span><strong>{creator.channelName}</strong><small>{creator.language ?? 'Language unknown'} · {creator.isSaved ? 'Saved' : 'Not saved'}</small></span></span>
              <span className={cn('status-pill', `status-${creator.status}`)}>{statusLabels[creator.status]}</span>
            </span>
            <span className="creator-card-signals">
              <span><small>Subscribers</small><strong>{formatCompact(creator.subscriberCount)}</strong></span>
              <span><small>Avg views</small><strong>{formatCompact(creator.averageRecentViews)}</strong></span>
              <span><small>Engagement</small><strong>{formatPercent(creator.engagementRate)}</strong></span>
            </span>
            <span className="creator-card-foot">
              <span className="creator-card-score"><Score value={creator.overallScore} /><small>Overall fit</small></span>
              <span className="creator-card-meta"><span>{relativeDate(creator.lastUploadAt)}</span>{(creator.contactEmail || creator.contactUrl) && <span className="contact-ready">{creator.contactEmail ? <Mail size={12} /> : <Link2 size={12} />} Contact saved</span>}</span>
              <ChevronRight className="row-chevron" size={17} />
            </span>
          </button>
        ))}
      </div>
      {!loading && !creators.length && <div className="table-empty">{emptyMessage ?? 'No creators match these filters.'}</div>}
    </div>
  )
}
