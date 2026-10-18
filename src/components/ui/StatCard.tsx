import Link from 'next/link'
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from './cn'

export type StatTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const ICON_TONES: Record<StatTone, string> = {
  accent: 'bg-accent-soft text-accent-text',
  success: 'bg-success-soft text-success-text',
  warning: 'bg-warning-soft text-warning-text',
  danger: 'bg-danger-soft text-danger-text',
  info: 'bg-info-soft text-info-text',
  neutral: 'bg-surface-inset text-fg-subtle',
}

/**
 * Headline metric tile.
 *
 * The value is the loudest element and uses tabular figures so a row of tiles
 * stays optically aligned as numbers change (e.g. 9 → 10 must not shift the
 * baseline). `delta` is rendered with both an arrow and a sign so the trend is
 * not communicated by colour alone.
 */
export default function StatCard({
  label,
  value,
  icon,
  tone = 'accent',
  href,
  delta,
  deltaLabel,
  hint,
  className,
}: {
  label: ReactNode
  value: ReactNode
  icon?: ReactNode
  tone?: StatTone
  href?: string
  /** Percentage change. Positive renders as an increase, negative a decrease. */
  delta?: number
  /** Context for the delta, e.g. "vs last week". */
  deltaLabel?: string
  hint?: ReactNode
  className?: string
}) {
  const up = (delta ?? 0) >= 0

  const body = (
    <>
      <div className="flex items-start gap-4">
        {icon && (
          <span
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              ICON_TONES[tone],
            )}
            aria-hidden
          >
            {icon}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-2xl font-bold leading-none tracking-tight text-fg"
            data-numeric
          >
            {value}
          </p>
          <p className="mt-1.5 truncate text-[13px] font-medium text-fg-subtle">{label}</p>
        </div>

        {href && (
          <ArrowRight
            className="h-4 w-4 shrink-0 text-fg-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
            aria-hidden
          />
        )}
      </div>

      {(delta !== undefined || hint) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                up ? 'bg-success-soft text-success-text' : 'bg-danger-soft text-danger-text',
              )}
            >
              {up ? (
                <TrendingUp className="h-3 w-3" aria-hidden />
              ) : (
                <TrendingDown className="h-3 w-3" aria-hidden />
              )}
              <span data-numeric>
                {up ? '+' : ''}
                {delta}%
              </span>
            </span>
          )}
          {(deltaLabel || hint) && (
            <span className="truncate text-fg-faint">{deltaLabel ?? hint}</span>
          )}
        </div>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={cn('zs-card zs-card-interactive group block p-5', className)}>
        {body}
      </Link>
    )
  }

  return <div className={cn('zs-card p-5', className)}>{body}</div>
}
