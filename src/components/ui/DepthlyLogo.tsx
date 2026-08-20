import { cn } from '../../lib/utils'

export function DepthlyMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg className={cn('depthly-mark', className)} width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="24" cy="24" r="14.5" stroke="currentColor" strokeWidth="1.25" opacity=".45" />
      <circle cx="24" cy="24" r="7.5" stroke="currentColor" strokeWidth="1.25" opacity=".2" />
      <circle className="depthly-mark-dot" cx="24" cy="24" r="3" />
    </svg>
  )
}

export function DepthlyLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('depthly-logo', compact && 'depthly-logo-compact', className)}>
      <DepthlyMark size={compact ? 28 : 34} />
      <div><strong>Depthly</strong>{compact ? null : <small>Creator outreach</small>}</div>
    </div>
  )
}
