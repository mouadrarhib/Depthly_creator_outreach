import { Check, Clipboard, ExternalLink, RefreshCw, Save, Star, ThumbsDown } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useCreatorSearch } from '../../hooks/useCreatorSearch'
import { useCreatorVideos, useImportCreator, useUpdateCreator } from '../../hooks/useCreators'
import { formatCompact, formatPercent, relativeDate } from '../../lib/utils'
import type { CreatorCandidate, CreatorStatus, DisplayCreator } from '../../types/creators'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'

const statuses: CreatorStatus[] = ['discovered', 'shortlisted', 'contacted', 'replied', 'negotiating', 'partnered', 'rejected']

export function CreatorDrawer({ creator, onClose, onRefreshed }: {
  creator: DisplayCreator | null
  onClose: () => void
  onRefreshed?: (candidate: CreatorCandidate) => void
}) {
  return <Sheet open={Boolean(creator)} onOpenChange={(open) => { if (!open) onClose() }}>
    {creator && <CreatorDrawerContent key={`${creator.youtubeChannelId}-${creator.id ?? 'new'}`} creator={creator} onRefreshed={onRefreshed} />}
  </Sheet>
}

function CreatorDrawerContent({ creator, onRefreshed }: { creator: DisplayCreator; onRefreshed?: (candidate: CreatorCandidate) => void }) {
  const [savedId, setSavedId] = useState(creator.id)
  const [status, setStatus] = useState(creator.status)
  const [email, setEmail] = useState(creator.contactEmail ?? '')
  const [contactUrl, setContactUrl] = useState(creator.contactUrl ?? '')
  const [notes, setNotes] = useState(creator.notes ?? '')
  const [feedback, setFeedback] = useState('')
  const importMutation = useImportCreator()
  const updateMutation = useUpdateCreator()
  const refreshMutation = useCreatorSearch()
  const videosQuery = useCreatorVideos(savedId)
  const videos = creator.recentVideos.length ? creator.recentVideos : (videosQuery.data ?? [])
  const busy = importMutation.isPending || updateMutation.isPending || refreshMutation.isPending

  const ensureSaved = async () => {
    if (savedId) return savedId
    const saved = await importMutation.mutateAsync(creator)
    setSavedId(saved.id)
    setFeedback('Creator saved')
    return saved.id
  }

  const changeStatus = async (nextStatus: CreatorStatus) => {
    try {
      const id = await ensureSaved()
      await updateMutation.mutateAsync({ id, values: { status: nextStatus } })
      setStatus(nextStatus)
      setFeedback(nextStatus === 'shortlisted' ? 'Added to shortlist' : `Status changed to ${nextStatus}`)
    } catch (error) { setFeedback(error instanceof Error ? error.message : 'Could not update status') }
  }

  const saveContact = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const id = await ensureSaved()
      await updateMutation.mutateAsync({ id, values: { contactEmail: email.trim(), contactUrl: contactUrl.trim(), notes: notes.trim() } })
      setFeedback('Contact details saved')
    } catch (error) { setFeedback(error instanceof Error ? error.message : 'Could not save contact details') }
  }

  const refresh = async () => {
    try {
      const response = await refreshMutation.mutateAsync({ query: creator.channelName, maxResults: 12, force: true })
      const updated = response.creators.find((item) => item.youtubeChannelId === creator.youtubeChannelId)
      if (!updated) throw new Error('This channel was not returned by YouTube. Try a discovery search instead.')
      const saved = await importMutation.mutateAsync(updated)
      setSavedId(saved.id)
      onRefreshed?.(updated)
      setFeedback('YouTube metrics refreshed')
    } catch (error) { setFeedback(error instanceof Error ? error.message : 'Could not refresh metrics') }
  }

  return (
    <div className="drawer-inner">
      <header className="drawer-header">
        <div className="drawer-avatar">{creator.thumbnailUrl ? <img src={creator.thumbnailUrl} alt="" /> : creator.channelName[0]}</div>
        <div><div className="drawer-title-line"><h2>{creator.channelName}</h2><span className={`status-pill status-${status}`}>{status}</span></div><a href={creator.channelUrl} target="_blank" rel="noreferrer">Open YouTube <ExternalLink size={12} /></a></div>
      </header>

      <div className="drawer-actions">
        <Button variant="primary" size="sm" onClick={() => changeStatus('shortlisted')} disabled={busy || status === 'shortlisted'}><Star size={14} /> {status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}</Button>
        <Button size="sm" onClick={() => ensureSaved().catch((error) => setFeedback(error.message))} disabled={busy || Boolean(savedId)}><Save size={14} /> {savedId ? 'Saved' : 'Save creator'}</Button>
        <Button variant="ghost" size="sm" onClick={() => changeStatus('rejected')} disabled={busy}><ThumbsDown size={14} /> Reject</Button>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={busy}><RefreshCw className={refreshMutation.isPending ? 'spin' : ''} size={14} /> Refresh</Button>
      </div>
      {feedback && <p className="drawer-feedback"><Check size={13} />{feedback}</p>}

      <section className="drawer-section">
        <div className="section-heading"><h3>Creator signal</h3><span>Recent sample</span></div>
        <div className="metric-grid">
          <div><span>Subscribers</span><strong>{formatCompact(creator.subscriberCount)}</strong></div>
          <div><span>Avg recent views</span><strong>{formatCompact(creator.averageRecentViews)}</strong></div>
          <div><span>Engagement</span><strong>{formatPercent(creator.engagementRate)}</strong></div>
          <div><span>Last upload</span><strong>{relativeDate(creator.lastUploadAt)}</strong></div>
        </div>
        <div className="overall-score"><span>Overall fit</span><strong>{creator.overallScore}<small>/100</small></strong><i><b style={{ width: `${creator.overallScore}%` }} /></i></div>
      </section>

      <section className="drawer-section">
        <div className="section-heading"><h3>Why this score</h3><span>Deterministic</span></div>
        <div className="score-breakdown">
          {[['Niche relevance', creator.nicheScore], ['Audience activity', creator.activityScore], ['Engagement quality', creator.engagementScore], ['Overall', creator.overallScore]].map(([label, value]) => <div key={String(label)}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong></div>)}
        </div>
      </section>

      <section className="drawer-section">
        <div className="section-heading"><h3>Recent videos</h3><span>{videos.length} sampled</span></div>
        {videosQuery.isLoading && !creator.recentVideos.length ? <p className="muted-message">Loading recent videos…</p> : <div className="recent-videos">{videos.map((video) => <div key={video.youtubeVideoId}><strong>{video.title}</strong><span>{relativeDate(video.publishedAt)} · {formatCompact(video.viewCount)} views · {formatCompact(video.likeCount)} likes · {formatCompact(video.commentCount)} comments</span></div>)}</div>}
      </section>

      <section className="drawer-section contact-section">
        <div className="section-heading"><h3>Contact and notes</h3><span>CRM data</span></div>
        <form onSubmit={saveContact}>
          <label><span>Business email</span><div className="input-with-action"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="creator@example.com" /><button type="button" onClick={() => email && navigator.clipboard.writeText(email)} aria-label="Copy email"><Clipboard size={14} /></button></div></label>
          <label><span>Contact URL</span><input type="url" value={contactUrl} onChange={(e) => setContactUrl(e.target.value)} placeholder="https://instagram.com/creator" /></label>
          <label><span>Internal notes</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Audience fit, outreach angle, context…" rows={4} /></label>
          <div className="contact-actions"><Button type="submit" variant="primary" size="sm" disabled={busy}>Save contact</Button><Button type="button" size="sm" onClick={() => changeStatus('contacted')} disabled={busy}>Mark contacted</Button><label className="status-select"><span className="sr-only">Status</span><select value={status} onChange={(e) => changeStatus(e.target.value as CreatorStatus)} disabled={busy}>{statuses.map((value) => <option value={value} key={value}>{value}</option>)}</select></label></div>
        </form>
      </section>
    </div>
  )
}
