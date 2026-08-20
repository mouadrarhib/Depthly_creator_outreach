import { describe, expect, it } from 'vitest'
import { toYoutubeFields } from './creator-data'
import type { CreatorCandidate } from '../types/creators'

const candidate: CreatorCandidate = {
  youtubeChannelId: 'UC123', channelName: 'Study Lab', channelUrl: 'https://youtube.com/channel/UC123', thumbnailUrl: null,
  subscriberCount: 10_000, totalViews: 200_000, videoCount: 30, averageRecentViews: 8_000, averageRecentLikes: 500,
  averageRecentComments: 20, engagementRate: 6.5, lastUploadAt: '2026-08-19T00:00:00Z', language: 'en', country: 'US',
  nicheScore: 90, activityScore: 80, engagementScore: 75, audienceFitScore: 100, overallScore: 86, discoveredFrom: 'study', recentVideos: [],
}

describe('creator persistence mapping', () => {
  it('contains YouTube and score fields but never CRM-owned fields', () => {
    const payload = toYoutubeFields(candidate)
    expect(payload.youtube_channel_id).toBe('UC123')
    expect(payload.last_synced_at).toEqual(expect.any(String))
    expect(payload).not.toHaveProperty('contact_email')
    expect(payload).not.toHaveProperty('contact_url')
    expect(payload).not.toHaveProperty('notes')
    expect(payload).not.toHaveProperty('status')
  })
})
