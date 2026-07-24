'use client'

import { AlertTriangle, RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'
import Button from './Button'
import { cn } from './cn'

/**
 * Failure state.
 *
 * Deliberately distinct from EmptyState: empty is a normal condition, error is
 * not, so this carries the danger tone and always offers a recovery path.
 *
 * `detail` is for the technical message. It is collapsed behind a <details> so
 * a stack trace or Mongo error never becomes the loudest thing on the page,
 * while still being available when someone is actually debugging.
 */
export default function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this section. Retrying usually resolves it.',
  detail,
  onRetry,
  action,
  className,
  size = 'md',
}: {
  title?: ReactNode
  description?: ReactNode
  detail?: string
  onRetry?: () => void
  action?: ReactNode
  className?: string
  size?: 'sm' | 'md'
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'gap-2 py-8' : 'gap-3 py-14',
        className,
      )}
    >
      <span
        className={cn(
          'mb-1 flex items-center justify-center rounded-2xl bg-danger-soft text-danger-text ring-1 ring-inset ring-danger-soft',
          size === 'sm' ? 'h-10 w-10' : 'h-14 w-14',
        )}
        aria-hidden
      >
        <AlertTriangle className={size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'} />
      </span>

      <p className={cn('font-semibold text-fg', size === 'sm' ? 'text-sm' : 'text-base')}>
        {title}
      </p>

      <p className="max-w-sm text-[13px] leading-relaxed text-fg-subtle">{description}</p>

      {detail && (
        <details className="mt-1 w-full max-w-md text-left">
          <summary className="cursor-pointer text-xs text-fg-faint hover:text-fg-subtle">
            Technical details
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-surface-inset p-3 text-left font-mono text-[11px] leading-relaxed text-fg-muted ring-1 ring-inset ring-line">
            {detail}
          </pre>
        </details>
      )}

      {(onRetry || action) && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              leadingIcon={<RotateCw className="h-3.5 w-3.5" />}
            >
              Try again
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  )
}
