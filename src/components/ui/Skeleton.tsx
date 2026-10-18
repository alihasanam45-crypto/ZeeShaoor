import { cn } from './cn'

/**
 * Loading placeholder.
 *
 * Uses the `.zs-skeleton` shimmer from globals.css, which is theme-aware — the
 * previous implementation hardcoded a near-black fill and injected a `<style>`
 * tag on every instance, so it was invisible in light mode and duplicated the
 * same keyframes N times per page.
 *
 * Skeletons should mirror the *shape* of the content they replace. A generic
 * grey box that snaps to a different layout is worse than a spinner.
 */
export default function Skeleton({
  className,
  rounded = 'md',
}: {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}) {
  const radius = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }[rounded]

  return <div aria-hidden className={cn('zs-skeleton', radius, className)} />
}

/** Multi-line text placeholder. The last line is short, as real text wraps. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}

/** Card-shaped placeholder matching the StatCard footprint. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('zs-card p-5 sm:p-6', className)} aria-hidden>
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 w-11" rounded="xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    </div>
  )
}

/**
 * Wrap a loading region so assistive tech announces the state change once the
 * content arrives, instead of silently swapping shimmering boxes.
 */
export function SkeletonRegion({
  loading,
  label = 'Loading content',
  children,
}: {
  loading: boolean
  label?: string
  children: React.ReactNode
}) {
  return (
    <div aria-busy={loading} aria-live="polite" aria-label={loading ? label : undefined}>
      {children}
    </div>
  )
}
