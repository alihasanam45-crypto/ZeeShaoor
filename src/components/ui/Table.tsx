import type { ReactNode } from 'react'
import { cn } from './cn'

/**
 * Data table primitives.
 *
 * `Table` must always be wrapped by `TableWrap`, which owns the horizontal
 * scroll container. That is what keeps wide tables from forcing the whole page
 * to scroll sideways on tablet and mobile — the single most common responsive
 * failure in dashboards.
 */
export function TableWrap({
  children,
  className,
  caption,
}: {
  children: ReactNode
  className?: string
  /** Screen-reader description of the table's purpose. */
  caption?: string
}) {
  return (
    <div
      className={cn(
        'zs-card overflow-hidden',
        className,
      )}
    >
      {/* tabindex makes the scroll region reachable by keyboard, so a table
          wider than the viewport is not a keyboard trap. */}
      <div
        className="overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label={caption ?? 'Data table'}
      >
        {children}
      </div>
    </div>
  )
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <table className={cn('w-full min-w-[36rem] border-collapse text-left text-sm', className)}>
      {children}
    </table>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-line bg-surface-inset">
      {children}
    </thead>
  )
}

export function TH({
  children,
  className,
  align = 'left',
  scope = 'col',
}: {
  children: ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
  scope?: 'col' | 'row'
}) {
  return (
    <th
      scope={scope}
      className={cn(
        'whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-line">{children}</tbody>
}

export function TR({
  children,
  className,
  interactive,
}: {
  children: ReactNode
  className?: string
  interactive?: boolean
}) {
  return (
    <tr className={cn(interactive && 'transition-colors hover:bg-surface-hover', className)}>
      {children}
    </tr>
  )
}

export function TD({
  children,
  className,
  align = 'left',
  numeric,
}: {
  children: ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
  /** Right-aligns and applies tabular figures — use for every numeric column. */
  numeric?: boolean
}) {
  return (
    <td
      data-numeric={numeric || undefined}
      className={cn(
        'px-4 py-3 text-fg-muted',
        (align === 'right' || numeric) && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </td>
  )
}

/** Full-width row for empty / error states inside a table body. */
export function TEmpty({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center">
        {children}
      </td>
    </tr>
  )
}
