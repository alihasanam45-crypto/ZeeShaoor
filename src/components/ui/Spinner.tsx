import { cn } from './cn'

const SIZES = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-[3px]',
} as const

/**
 * Indeterminate loading indicator.
 *
 * Built from a border rather than an SVG so it inherits `currentColor` and
 * costs nothing to render inside buttons.
 */
export default function Spinner({
  size = 'sm',
  className,
  label = 'Loading',
}: {
  size?: keyof typeof SIZES
  className?: string
  /** Announced to screen readers. Pass `null` when a parent already labels the busy region. */
  label?: string | null
}) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label ?? undefined}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-r-transparent align-[-0.125em]',
        SIZES[size],
        className,
      )}
    />
  )
}
