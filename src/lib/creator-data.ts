import { supabase } from './supabase'
import { calculateEngagementRate } from './utils'
import type { CreatorCandidate, CreatorStatus, CreatorVideo, DisplayCreator, PersistedCreator } from '../types/creators'

type Row = Record<string, unknown>

const numberOrNull = (value: unknown) => value === null || value === undefined ? null : Number(value)

export function mapCreator(row: Row): PersistedCreator {
  return {
    id: String(row.id),
    youtubeChannelId: String(row.youtube_channel_id),
    channelName: String(row.channel_name),
    channelUrl: String(row.channel_url),
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : null,
    subscriberCount: numberOrNull(row.subscriber_count),
    totalViews: numberOrNull(row.total_views),
    videoCount: numberOrNull(row.video_count),
    averageRecentViews: numberOrNull(row.avg_recent_views),
    averageRecentLikes: numberOrNull(row.avg_recent_likes),
    averageRecentComments: numberOrNull(row.avg_recent_comments),
    lastUploadAt: row.last_upload_at ? String(row.last_upload_at) : null,
    language: row.language ? String(row.language) : null,
    country: row.country ? String(row.country) : null,
    nicheScore: Number(row.niche_score),
    activityScore: Number(row.activity_score),
    engagementScore: Number(row.engagement_score),
    overallScore: Number(row.overall_score),
    contactEmail: row.contact_email ? String(row.contact_email) : null,
    contactUrl: row.contact_url ? String(row.contact_url) : null,
    status: String(row.status) as CreatorStatus,
    notes: row.notes ? String(row.notes) : null,
    discoveredFrom: row.discovered_from ? String(row.discovered_from) : null,
    lastSyncedAt: row.last_synced_at ? String(row.last_synced_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export function mapVideo(row: Row): CreatorVideo {
  return {
    id: String(row.id),
    creatorId: String(row.creator_id),
    youtubeVideoId: String(row.youtube_video_id),
    title: String(row.title),
    publishedAt: row.published_at ? String(row.published_at) : null,
    viewCount: numberOrNull(row.view_count),
    likeCount: numberOrNull(row.like_count),
    commentCount: numberOrNull(row.comment_count),
  }
}

export async function fetchCreators(status?: CreatorStatus): Promise<PersistedCreator[]> {
  let query = supabase.from('creators').select('*').order('overall_score', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((row) => mapCreator(row as Row))
}

export async function fetchCreatorVideos(creatorId: string): Promise<CreatorVideo[]> {
  const { data, error } = await supabase
    .from('creator_videos')
    .select('*')
    .eq('creator_id', creatorId)
    .order('published_at', { ascending: false })
    .limit(5)
  if (error) throw error
  return (data ?? []).map((row) => mapVideo(row as Row))
}

export const toYoutubeFields = (candidate: CreatorCandidate) => ({
  youtube_channel_id: candidate.youtubeChannelId,
  channel_name: candidate.channelName,
  channel_url: candidate.channelUrl,
  thumbnail_url: candidate.thumbnailUrl,
  subscriber_count: candidate.subscriberCount,
  total_views: candidate.totalViews,
  video_count: candidate.videoCount,
  avg_recent_views: candidate.averageRecentViews,
  avg_recent_likes: candidate.averageRecentLikes,
  avg_recent_comments: candidate.averageRecentComments,
  last_upload_at: candidate.lastUploadAt,
  language: candidate.language,
  country: candidate.country,
  niche_score: candidate.nicheScore,
  activity_score: candidate.activityScore,
  engagement_score: candidate.engagementScore,
  overall_score: candidate.overallScore,
  discovered_from: candidate.discoveredFrom,
  last_synced_at: new Date().toISOString(),
})

export async function importCreator(candidate: CreatorCandidate): Promise<PersistedCreator> {
  const existing = await supabase
    .from('creators')
    .select('id')
    .eq('youtube_channel_id', candidate.youtubeChannelId)
    .maybeSingle()
  if (existing.error) throw existing.error

  const write = existing.data
    ? supabase.from('creators').update(toYoutubeFields(candidate)).eq('id', existing.data.id).select('*').single()
    : supabase.from('creators').insert({ ...toYoutubeFields(candidate), status: 'discovered' }).select('*').single()
  const { data: creator, error } = await write
  if (error) throw error

  const creatorId = creator.id as string
  const videos = candidate.recentVideos.slice(0, 5).map((video) => ({
    creator_id: creatorId,
    youtube_video_id: video.youtubeVideoId,
    title: video.title,
    published_at: video.publishedAt,
    view_count: video.viewCount,
    like_count: video.likeCount,
    comment_count: video.commentCount,
  }))
  if (videos.length) {
    const { error: videoError } = await supabase.from('creator_videos').upsert(videos, { onConflict: 'youtube_video_id' })
    if (videoError) throw videoError
    const keepIds = videos.map((video) => `"${video.youtube_video_id}"`)
    const { error: pruneError } = await supabase
      .from('creator_videos')
      .delete()
      .eq('creator_id', creatorId)
      .not('youtube_video_id', 'in', `(${keepIds.join(',')})`)
    if (pruneError) throw pruneError
  } else {
    const { error: pruneError } = await supabase.from('creator_videos').delete().eq('creator_id', creatorId)
    if (pruneError) throw pruneError
  }

  return mapCreator(creator as Row)
}

export async function updateCreatorCrm(id: string, values: {
  contactEmail?: string | null
  contactUrl?: string | null
  notes?: string | null
  status?: CreatorStatus
}) {
  const payload: Row = {}
  if ('contactEmail' in values) payload.contact_email = values.contactEmail || null
  if ('contactUrl' in values) payload.contact_url = values.contactUrl || null
  if ('notes' in values) payload.notes = values.notes || null
  if (values.status) payload.status = values.status
  const { data, error } = await supabase.from('creators').update(payload).eq('id', id).select('*').single()
  if (error) throw error
  return mapCreator(data as Row)
}

export function mergeCandidate(candidate: CreatorCandidate, saved?: PersistedCreator): DisplayCreator {
  return {
    ...candidate,
    id: saved?.id,
    contactEmail: saved?.contactEmail ?? null,
    contactUrl: saved?.contactUrl ?? null,
    status: saved?.status ?? 'discovered',
    notes: saved?.notes ?? null,
    lastSyncedAt: saved?.lastSyncedAt ?? null,
    isSaved: Boolean(saved),
  }
}

export function persistedToDisplay(creator: PersistedCreator, videos: CreatorVideo[] = []): DisplayCreator {
  const persistedEngagement = creator.averageRecentViews && creator.averageRecentViews > 0
    ? (((creator.averageRecentLikes ?? 0) + (creator.averageRecentComments ?? 0)) / creator.averageRecentViews) * 100
    : null
  return {
    youtubeChannelId: creator.youtubeChannelId,
    channelName: creator.channelName,
    channelUrl: creator.channelUrl,
    thumbnailUrl: creator.thumbnailUrl,
    subscriberCount: creator.subscriberCount,
    totalViews: creator.totalViews,
    videoCount: creator.videoCount,
    averageRecentViews: creator.averageRecentViews,
    averageRecentLikes: creator.averageRecentLikes,
    averageRecentComments: creator.averageRecentComments,
    engagementRate: videos.length ? calculateEngagementRate(videos) : persistedEngagement,
    lastUploadAt: creator.lastUploadAt,
    language: creator.language,
    country: creator.country,
    nicheScore: creator.nicheScore,
    activityScore: creator.activityScore,
    engagementScore: creator.engagementScore,
    audienceFitScore: 0,
    overallScore: creator.overallScore,
    discoveredFrom: creator.discoveredFrom ?? '',
    recentVideos: videos,
    id: creator.id,
    contactEmail: creator.contactEmail,
    contactUrl: creator.contactUrl,
    status: creator.status,
    notes: creator.notes,
    lastSyncedAt: creator.lastSyncedAt,
    isSaved: true,
  }
}
