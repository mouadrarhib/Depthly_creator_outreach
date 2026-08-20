import clsx, { type ClassValue } from 'clsx'

export const cn = (...values: ClassValue[]) => clsx(values)

export function formatCompact(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatPercent(value: number | null): string {
  return value === null ? '—' : `${value.toFixed(1)}%`
}

export function relativeDate(value: string | null): string {
  if (!value) return 'Unknown'
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000))
  if (days === 0) return 'Today'
  if (days === 1) return '1d ago'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export function calculateEngagementRate(videos: { viewCount: number | null; likeCount: number | null; commentCount: number | null }[]) {
  const totals = videos.reduce((sum, video) => ({
    views: sum.views + (video.viewCount ?? 0),
    interactions: sum.interactions + (video.likeCount ?? 0) + (video.commentCount ?? 0),
  }), { views: 0, interactions: 0 })
  return totals.views ? (totals.interactions / totals.views) * 100 : null
}
