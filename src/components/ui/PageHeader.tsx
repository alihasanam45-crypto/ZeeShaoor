import type { ReactNode } from 'react'
import { cn } from './cn'

/**
 * The consistent top-of-page block: eyebrow, title, description, actions.
 *
 * Every page previously hand-rolled this, which is why heading sizes, weights
 * and bottom margins drifted between the three portals. Using this component
 * is what makes pages feel like one product.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-text">
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-fg-subtle">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )
}

/**
 * Standard page container: max width, responsive gutters, vertical rhythm.
 *
 * `width="wide"` is for data-dense console pages; `full` opts out entirely for
 * things like the Paper Generator's split-pane layout.
 */
export function PageContainer({
  children,
  className,
  width = 'default',
}: {
  children: ReactNode
  className?: string
  width?: 'default' | 'wide' | 'full'
}) {
  return (
    <div
      id="main-content"
      className={cn(
        'mx-auto w-full space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8',
        width === 'default' && 'max-w-6xl',
        // Ultra-wide displays: cap the line length rather than letting tables
        // stretch to 3000px, which destroys scannability.
        width === 'wide' && 'max-w-[1600px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Section heading used between card groups within a page. */
export function SectionHeading({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-fg">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-fg-subtle">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
