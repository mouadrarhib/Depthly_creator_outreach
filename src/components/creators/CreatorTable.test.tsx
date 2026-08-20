import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { DisplayCreator } from '../../types/creators'
import { CreatorTable } from './CreatorTable'

const creator: DisplayCreator = {
  youtubeChannelId: 'channel-1',
  channelName: 'Focus Study',
  channelUrl: 'https://youtube.com/channel/channel-1',
  thumbnailUrl: null,
  subscriberCount: 42000,
  totalViews: 1_000_000,
  videoCount: 120,
  averageRecentViews: 18000,
  averageRecentLikes: 900,
  averageRecentComments: 80,
  engagementRate: 5.4,
  lastUploadAt: '2026-08-19T12:00:00Z',
  language: 'en',
  country: 'US',
  discoveredFrom: 'study with me',
  recentVideos: [],
  nicheScore: 92,
  activityScore: 86,
  engagementScore: 88,
  audienceFitScore: 100,
  overallScore: 90,
  contactEmail: 'hello@example.com',
  contactUrl: null,
  status: 'shortlisted',
  notes: null,
  lastSyncedAt: '2026-08-20T12:00:00Z',
  isSaved: true,
}

describe('CreatorTable responsive results', () => {
  it('opens a creator from the mobile card representation', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<CreatorTable creators={[creator]} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: /Focus Study/i }))
    expect(onSelect).toHaveBeenCalledWith(creator)
  })
})
