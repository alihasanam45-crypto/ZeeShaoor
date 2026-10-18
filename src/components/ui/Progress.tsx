import { cn } from './cn'

export type ProgressTone = 'accent' | 'success' | 'warning' | 'danger'

const TONES: Record<ProgressTone, string> = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

/**
 * Determinate progress bar.
 *
 * Exposes proper `progressbar` semantics with min/max/now so screen readers
 * announce completion, and clamps the value so a bad computation can never
 * overflow the track.
 */
export default function Progress({
  value,
  max = 100,
  tone = 'accent',
  size = 'md',
  label,
  showValue = false,
  className,
}: {
  value: number
  max?: number
  tone?: ProgressTone
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showValue?: boolean
  className?: string
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100))

  const height = { sm: 'h-1', md: 'h-2', lg: 'h-2.5' }[size]

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {label && <span className="text-[13px] font-medium text-fg-muted">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-fg-subtle" data-numeric>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={cn('w-full overflow-hidden rounded-full bg-surface-inset', height)}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500 ease-out-quint', TONES[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Circular progress, for compact score/completion displays.
 * Sized in px because SVG stroke geometry needs concrete numbers.
 */
export function ProgressRing({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  tone = 'accent',
  children,
  className,
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  tone?: ProgressTone
  children?: React.ReactNode
  className?: string
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const strokeColor = {
    accent: 'var(--accent)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
  }[tone]

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-inset)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (pct / 100) * circumference}
          className="transition-[stroke-dashoffset] duration-700 ease-out-quint"
        />
      </svg>
      {children && (
        <span className="absolute inset-0 flex items-center justify-center">{children}</span>
      )}
    </div>
  )
}
