import type { ReactNode } from 'react'
import { cn } from './cn'

/**
 * Zero-data state.
 *
 * An empty state should explain *why* it is empty and offer the next action —
 * "No classes assigned yet" plus a route to fix it, not just a shrug. Several
 * pages previously rendered a bare grey sentence with no way forward.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  secondaryAction?: ReactNode
  className?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'gap-2 py-8' : 'gap-3 py-14',
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            'mb-1 flex items-center justify-center rounded-2xl bg-surface-inset text-fg-faint ring-1 ring-inset ring-line',
            size === 'sm' ? 'h-10 w-10' : 'h-14 w-14',
          )}
          aria-hidden
        >
          {icon}
        </span>
      )}

      <p className={cn('font-semibold text-fg', size === 'sm' ? 'text-sm' : 'text-base')}>
        {title}
      </p>

      {description && (
        <p className="max-w-sm text-[13px] leading-relaxed text-fg-subtle">{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
