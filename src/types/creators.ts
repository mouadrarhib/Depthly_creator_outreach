export const CREATOR_STATUSES = [
  'discovered', 'shortlisted', 'contacted', 'replied', 'negotiating', 'partnered', 'rejected',
] as const

export type CreatorStatus = typeof CREATOR_STATUSES[number]

export interface CreatorScores {
  nicheScore: number
  activityScore: number
  engagementScore: number
  audienceFitScore: number
  overallScore: number
}

export interface CreatorVideo {
  id?: string
  creatorId?: string
  youtubeVideoId: string
  title: string
  publishedAt: string | null
  viewCount: number | null
  likeCount: number | null
  commentCount: number | null
}

export interface CreatorCandidate extends CreatorScores {
  youtubeChannelId: string
  channelName: string
  channelUrl: string
  thumbnailUrl: string | null
  subscriberCount: number | null
  totalViews: number | null
  videoCount: number | null
  averageRecentViews: number | null
  averageRecentLikes: number | null
  averageRecentComments: number | null
  engagementRate: number | null
  lastUploadAt: string | null
  language: string | null
  country: string | null
  discoveredFrom: string
  recentVideos: CreatorVideo[]
}

export interface PersistedCreator {
  id: string
  youtubeChannelId: string
  channelName: string
  channelUrl: string
  thumbnailUrl: string | null
  subscriberCount: number | null
  totalViews: number | null
  videoCount: number | null
  averageRecentViews: number | null
  averageRecentLikes: number | null
  averageRecentComments: number | null
  lastUploadAt: string | null
  language: string | null
  country: string | null
  nicheScore: number
  activityScore: number
  engagementScore: number
  overallScore: number
  contactEmail: string | null
  contactUrl: string | null
  status: CreatorStatus
  notes: string | null
  discoveredFrom: string | null
  lastSyncedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DisplayCreator extends CreatorCandidate {
  id?: string
  contactEmail: string | null
  contactUrl: string | null
  status: CreatorStatus
  notes: string | null
  lastSyncedAt: string | null
  isSaved: boolean
}

export interface CreatorSearchResponse {
  query: string
  creators: CreatorCandidate[]
  searchedAt: string
  nextPageToken: string | null
  previousPageToken: string | null
  estimatedTotalResults: number | null
}

export interface DiscoveryFilters {
  minimumSubscribers: number | null
  maximumSubscribers: number | null
  minimumAverageViews: number | null
  language: string
  country: string
  uploadedWithinDays: number | null
  minimumOverallScore: number | null
  status: CreatorStatus | 'all'
}

export type CreatorSort = 'overall' | 'views' | 'subscribers' | 'engagement' | 'newest'
