import type { ReactNode } from 'react'
import { cn } from './cn'

export type BadgeTone =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

/* Soft-fill badges: tinted background + high-contrast text of the same hue.
   Solid-fill status chips fail contrast at this size once the label drops to
   11px, which is why every tone pairs `*-soft` with `*-text`. */
const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-inset text-fg-muted ring-line',
  accent: 'bg-accent-soft text-accent-text ring-accent-soft',
  success: 'bg-success-soft text-success-text ring-success-soft',
  warning: 'bg-warning-soft text-warning-text ring-warning-soft',
  danger: 'bg-danger-soft text-danger-text ring-danger-soft',
  info: 'bg-info-soft text-info-text ring-info-soft',
}

const DOT: Record<BadgeTone, string> = {
  neutral: 'bg-fg-faint',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
}

/**
 * Compact status label.
 *
 * `dot` adds a leading indicator so state is not conveyed by colour alone —
 * important for the at-risk / pass-fail chips used across the teacher portal.
 */
export default function Badge({
  children,
  tone = 'neutral',
  dot = false,
  pulse = false,
  size = 'md',
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  dot?: boolean
  /** Animated halo on the dot, for genuinely live values only. */
  pulse?: boolean
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        TONES[tone],
        className,
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span
              className={cn('absolute inset-0 rounded-full animate-pulse-ring', DOT[tone])}
              aria-hidden
            />
          )}
          <span className={cn('relative h-1.5 w-1.5 rounded-full', DOT[tone])} />
        </span>
      )}
      {children}
    </span>
  )
}
