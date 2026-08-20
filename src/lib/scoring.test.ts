import { describe, expect, it } from 'vitest'
import {
  calculateActivityScore,
  calculateAudienceFitScore,
  calculateCreatorScores,
  calculateEngagementScore,
  calculateNicheScore,
  tokenize,
} from './scoring'

describe('creator scoring', () => {
  it('normalizes meaningful query tokens', () => {
    expect(tokenize('Study WITH me — study & Focus!')).toEqual(['study', 'focus'])
  })

  it('scores niche coverage and recent-title hit rate deterministically', () => {
    expect(calculateNicheScore('study with me', 'Study Lab', ['Study routine', 'Exam prep', 'Deep work', 'Study vlog', 'Focus music'])).toBe(76)
  })

  it('combines recency and sampled upload frequency', () => {
    expect(calculateActivityScore(['2026-08-19T00:00:00Z', '2026-08-01T00:00:00Z'], new Date('2026-08-20T00:00:00Z'))).toBe(82)
    expect(calculateActivityScore([], new Date('2026-08-20T00:00:00Z'))).toBe(0)
  })

  it('caps viral engagement components and handles hidden subscribers', () => {
    expect(calculateEngagementScore({ totalViews: 1_000, totalLikes: 100, totalComments: 20, averageViews: 500, subscriberCount: 1_000 })).toBe(100)
    expect(calculateEngagementScore({ totalViews: 1_000, totalLikes: 40, totalComments: 5, averageViews: 500, subscriberCount: null })).toBe(50)
    expect(calculateEngagementScore({ totalViews: 0, totalLikes: 10, totalComments: 1, averageViews: 0, subscriberCount: 1_000 })).toBe(0)
  })

  it('uses the documented audience fit bands', () => {
    expect([null, 999, 1_000, 250_000, 250_001, 1_000_000, 1_000_001].map(calculateAudienceFitScore)).toEqual([50, 60, 100, 100, 70, 70, 40])
  })

  it('returns rounded scores in the zero to one hundred range', () => {
    const scores = calculateCreatorScores({
      query: 'study', channelName: 'Study Lab', titles: ['Study routine'], publishedDates: ['2026-08-19T00:00:00Z'],
      totalViews: 1_000, totalLikes: 40, totalComments: 5, averageViews: 1_000, subscriberCount: 5_000,
      now: new Date('2026-08-20T00:00:00Z'),
    })
    expect(scores).toEqual({ nicheScore: 100, activityScore: 76, engagementScore: 46, audienceFitScore: 100, overallScore: 82 })
    Object.values(scores).forEach((value) => expect(value).toBeGreaterThanOrEqual(0))
  })
})
