export const SCORING_WEIGHTS = {
  niche: 0.45,
  engagement: 0.25,
  activity: 0.2,
  audienceFit: 0.1,
} as const

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'at', 'for', 'from', 'how', 'in', 'me', 'my', 'of', 'on',
  'the', 'to', 'with', 'your',
])

const clamp = (value: number) => Math.max(0, Math.min(100, value))
const score = (value: number) => Math.round(clamp(value))

export function tokenize(value: string): string[] {
  return [...new Set(value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token)))]
}

export function calculateNicheScore(query: string, channelName: string, titles: string[]): number {
  const queryTokens = tokenize(query)
  if (!queryTokens.length) return 0

  const corpus = new Set(tokenize([channelName, ...titles].join(' ')))
  const tokenCoverage = queryTokens.filter((token) => corpus.has(token)).length / queryTokens.length
  const videoHitRate = titles.length
    ? titles.filter((title) => {
        const titleTokens = new Set(tokenize(title))
        return queryTokens.some((token) => titleTokens.has(token))
      }).length / titles.length
    : 0

  return score((tokenCoverage * 60) + (videoHitRate * 40))
}

function recencyScore(daysSinceUpload: number): number {
  if (daysSinceUpload <= 7) return 100
  if (daysSinceUpload <= 14) return 85
  if (daysSinceUpload <= 30) return 70
  if (daysSinceUpload <= 60) return 45
  if (daysSinceUpload <= 90) return 25
  return 0
}

export function calculateActivityScore(publishedDates: string[], now = new Date()): number {
  const validDates = publishedDates
    .map((date) => new Date(date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())
  if (!validDates.length) return 0

  const dayMs = 86_400_000
  const daysSinceLatest = Math.max(0, (now.getTime() - validDates[0].getTime()) / dayMs)
  const uploadsIn90Days = validDates.filter((date) => now.getTime() - date.getTime() <= 90 * dayMs).length
  const frequency = Math.min(uploadsIn90Days / 5, 1) * 100
  return score((recencyScore(daysSinceLatest) * 0.7) + (frequency * 0.3))
}

export interface EngagementInput {
  totalViews: number
  totalLikes: number
  totalComments: number
  averageViews: number
  subscriberCount: number | null
}

export function calculateEngagementScore(input: EngagementInput): number {
  if (input.totalViews <= 0) return 0
  const likeComponent = Math.min(input.totalLikes / input.totalViews / 0.08, 1) * 100
  const commentComponent = Math.min(input.totalComments / input.totalViews / 0.01, 1) * 100

  if (input.subscriberCount === null || input.subscriberCount <= 0) {
    return score((likeComponent * (2 / 3)) + (commentComponent * (1 / 3)))
  }

  const viewComponent = Math.min(input.averageViews / input.subscriberCount / 0.5, 1) * 100
  return score((viewComponent * 0.4) + (likeComponent * 0.4) + (commentComponent * 0.2))
}

export function calculateAudienceFitScore(subscriberCount: number | null): number {
  if (subscriberCount === null) return 50
  if (subscriberCount < 1_000) return 60
  if (subscriberCount <= 250_000) return 100
  if (subscriberCount <= 1_000_000) return 70
  return 40
}

export interface CreatorScoreInput extends EngagementInput {
  query: string
  channelName: string
  titles: string[]
  publishedDates: string[]
  now?: Date
}

export function calculateCreatorScores(input: CreatorScoreInput) {
  const nicheScore = calculateNicheScore(input.query, input.channelName, input.titles)
  const activityScore = calculateActivityScore(input.publishedDates, input.now)
  const engagementScore = calculateEngagementScore(input)
  const audienceFitScore = calculateAudienceFitScore(input.subscriberCount)
  const overallScore = score(
    nicheScore * SCORING_WEIGHTS.niche
    + engagementScore * SCORING_WEIGHTS.engagement
    + activityScore * SCORING_WEIGHTS.activity
    + audienceFitScore * SCORING_WEIGHTS.audienceFit,
  )

  return { nicheScore, activityScore, engagementScore, audienceFitScore, overallScore }
}
