import { calculateCreatorScores } from '../_shared/scoring.ts'
import { SearchValidationError, validateSearchInput } from '../_shared/search-contract.ts'

const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3'
const SAMPLE_SIZE = 5

interface PlaylistItem {
  contentDetails?: { videoId?: string; videoPublishedAt?: string }
  snippet?: { title?: string; publishedAt?: string }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

class ApiError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message)
  }
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})

const parseCount = (value: unknown): number | null => {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const average = (values: (number | null)[]) => {
  const present = values.filter((value): value is number => value !== null)
  return present.length ? Math.round(present.reduce((sum, value) => sum + value, 0) / present.length) : null
}

const decodeTitle = (value: string) => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))

async function youtube(path: string, parameters: Record<string, string | number>) {
  const key = Deno.env.get('YOUTUBE_API_KEY')
  if (!key) throw new ApiError('SERVER_CONFIGURATION', 'YouTube API access is not configured.', 500)

  const url = new URL(`${YOUTUBE_API}/${path}`)
  Object.entries({ ...parameters, key }).forEach(([name, value]) => url.searchParams.set(name, String(value)))
  const response = await fetch(url)
  const payload = await response.json()
  if (!response.ok) {
    const reason = payload?.error?.errors?.[0]?.reason
    if (['quotaExceeded', 'dailyLimitExceeded', 'rateLimitExceeded'].includes(reason)) {
      throw new ApiError('YOUTUBE_QUOTA', 'YouTube API quota reached. Try again after the quota resets.', 429)
    }
    throw new ApiError('YOUTUBE_UPSTREAM', payload?.error?.message ?? 'YouTube could not complete the request.', 502)
  }
  return payload
}

const chunks = <T>(values: T[], size: number) => {
  const result: T[][] = []
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size))
  return result
}

function mostCommon(values: (string | undefined)[]): string | null {
  const counts = new Map<string, number>()
  values.filter(Boolean).forEach((value) => counts.set(value!, (counts.get(value!) ?? 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ code: 'METHOD_NOT_ALLOWED', message: 'Use POST for creator search.' }, 405)
  if (!request.headers.get('Authorization')) return json({ code: 'UNAUTHENTICATED', message: 'Sign in to search YouTube.' }, 401)

  try {
    let body: { query?: unknown; maxResults?: unknown; pageToken?: unknown }
    try {
      body = await request.json()
    } catch {
      throw new ApiError('INVALID_REQUEST', 'Send a valid JSON request body.', 400)
    }

    const { query, maxResults: requestedMax, pageToken } = validateSearchInput(body)

    const search = await youtube('search', {
      part: 'snippet', type: 'video', q: query, maxResults: requestedMax, safeSearch: 'moderate',
      ...(pageToken ? { pageToken } : {}),
    })
    const channelIds = [...new Set<string>((search.items ?? [])
      .map((item: { snippet?: { channelId?: string } }) => item.snippet?.channelId)
      .filter((id: string | undefined): id is string => Boolean(id)))]
      .slice(0, requestedMax)

    const pagination = {
      nextPageToken: typeof search.nextPageToken === 'string' ? search.nextPageToken : null,
      previousPageToken: typeof search.prevPageToken === 'string' ? search.prevPageToken : null,
      estimatedTotalResults: Number.isFinite(Number(search.pageInfo?.totalResults)) ? Number(search.pageInfo.totalResults) : null,
    }

    if (!channelIds.length) return json({ query, creators: [], searchedAt: new Date().toISOString(), ...pagination })

    const channelPayload = await youtube('channels', {
      part: 'snippet,statistics,contentDetails', id: channelIds.join(','), maxResults: channelIds.length,
    })

    const playlistResults: [string, PlaylistItem[]][] = await Promise.all((channelPayload.items ?? []).map(async (channel: {
      id: string
      contentDetails?: { relatedPlaylists?: { uploads?: string } }
    }) => {
      const playlistId = channel.contentDetails?.relatedPlaylists?.uploads
      if (!playlistId) return [channel.id, []] as [string, PlaylistItem[]]
      const payload = await youtube('playlistItems', { part: 'snippet,contentDetails', playlistId, maxResults: SAMPLE_SIZE })
      return [channel.id, payload.items ?? []] as [string, PlaylistItem[]]
    }))

    const playlistByChannel = new Map(playlistResults)
    const allVideoIds = playlistResults.flatMap(([, items]) => items.map((item: {
      contentDetails?: { videoId?: string }
    }) => item.contentDetails?.videoId).filter(Boolean)) as string[]

    const videoPayloads = await Promise.all(chunks(allVideoIds, 50).map((ids) => youtube('videos', {
      part: 'snippet,statistics', id: ids.join(','), maxResults: ids.length,
    })))
    const videosById = new Map(videoPayloads.flatMap((payload) => payload.items ?? []).map((video: { id: string }) => [video.id, video]))

    const creators = (channelPayload.items ?? []).map((channel: {
      id: string
      snippet?: { title?: string; thumbnails?: { default?: { url?: string }; medium?: { url?: string } }; country?: string; defaultLanguage?: string }
      statistics?: { subscriberCount?: string; hiddenSubscriberCount?: boolean; viewCount?: string; videoCount?: string }
    }) => {
      const playlistItems = playlistByChannel.get(channel.id) ?? []
      const recentVideos = playlistItems.map((item: PlaylistItem) => {
        const videoId = item.contentDetails?.videoId ?? ''
        const detail = videosById.get(videoId) as {
          snippet?: { title?: string; publishedAt?: string; defaultLanguage?: string; defaultAudioLanguage?: string }
          statistics?: { viewCount?: string; likeCount?: string; commentCount?: string }
        } | undefined
        return {
          youtubeVideoId: videoId,
          title: decodeTitle(detail?.snippet?.title ?? item.snippet?.title ?? 'Untitled video'),
          publishedAt: detail?.snippet?.publishedAt ?? item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt ?? null,
          viewCount: parseCount(detail?.statistics?.viewCount),
          likeCount: parseCount(detail?.statistics?.likeCount),
          commentCount: parseCount(detail?.statistics?.commentCount),
          language: detail?.snippet?.defaultAudioLanguage ?? detail?.snippet?.defaultLanguage,
        }
      }).filter((video: { youtubeVideoId: string }) => video.youtubeVideoId)

      const totalSampleViews = recentVideos.reduce((sum: number, video: { viewCount: number | null }) => sum + (video.viewCount ?? 0), 0)
      const totalSampleLikes = recentVideos.reduce((sum: number, video: { likeCount: number | null }) => sum + (video.likeCount ?? 0), 0)
      const totalSampleComments = recentVideos.reduce((sum: number, video: { commentCount: number | null }) => sum + (video.commentCount ?? 0), 0)
      const subscriberCount = channel.statistics?.hiddenSubscriberCount ? null : parseCount(channel.statistics?.subscriberCount)
      const averageRecentViews = average(recentVideos.map((video: { viewCount: number | null }) => video.viewCount))
      const channelName = decodeTitle(channel.snippet?.title ?? 'Unknown channel')
      const scores = calculateCreatorScores({
        query,
        channelName,
        titles: recentVideos.map((video: { title: string }) => video.title),
        publishedDates: recentVideos.map((video: { publishedAt: string | null }) => video.publishedAt).filter(Boolean) as string[],
        totalViews: totalSampleViews,
        totalLikes: totalSampleLikes,
        totalComments: totalSampleComments,
        averageViews: averageRecentViews ?? 0,
        subscriberCount,
      })

      return {
        youtubeChannelId: channel.id,
        channelName,
        channelUrl: `https://www.youtube.com/channel/${channel.id}`,
        thumbnailUrl: channel.snippet?.thumbnails?.medium?.url ?? channel.snippet?.thumbnails?.default?.url ?? null,
        subscriberCount,
        totalViews: parseCount(channel.statistics?.viewCount),
        videoCount: parseCount(channel.statistics?.videoCount),
        averageRecentViews,
        averageRecentLikes: average(recentVideos.map((video: { likeCount: number | null }) => video.likeCount)),
        averageRecentComments: average(recentVideos.map((video: { commentCount: number | null }) => video.commentCount)),
        engagementRate: totalSampleViews ? ((totalSampleLikes + totalSampleComments) / totalSampleViews) * 100 : null,
        lastUploadAt: recentVideos[0]?.publishedAt ?? null,
        language: channel.snippet?.defaultLanguage ?? mostCommon(recentVideos.map((video: { language?: string }) => video.language)),
        country: channel.snippet?.country ?? null,
        discoveredFrom: query,
        recentVideos: recentVideos.map(({ language: _language, ...video }: { language?: string; [key: string]: unknown }) => video),
        ...scores,
      }
    }).sort((a: { overallScore: number }, b: { overallScore: number }) => b.overallScore - a.overallScore)

    return json({ query, creators, searchedAt: new Date().toISOString(), ...pagination })
  } catch (error) {
    if (error instanceof SearchValidationError) return json({ code: error.code, message: error.message }, 400)
    if (error instanceof ApiError) return json({ code: error.code, message: error.message }, error.status)
    console.error(error)
    return json({ code: 'INTERNAL_ERROR', message: 'Creator search failed unexpectedly.' }, 500)
  }
})
