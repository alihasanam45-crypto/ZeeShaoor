import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from './cn'

type CardProps = {
  children: ReactNode
  className?: string
  /** Adds hover lift + pointer affordance. Implied when `href` is set. */
  interactive?: boolean
  /** Renders the whole card as a link. */
  href?: string
  /** Frosted translucent treatment, for cards over imagery or gradients. */
  glass?: boolean
  /** Adds the top-edge specular highlight. Reserve for hero/feature cards. */
  sheen?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
} as const

/**
 * The surface primitive everything else sits on.
 *
 * Elevation is a hairline inset ring plus a soft shadow (see `.zs-card`), not
 * a 1px solid border — borders read as heavy and crowd dense layouts, and they
 * compound badly when cards nest.
 */
export default function Card({
  children,
  className,
  interactive,
  href,
  glass,
  sheen,
  padding = 'md',
}: CardProps) {
  const classes = cn(
    glass ? 'zs-glass rounded-xl ring-1 ring-inset ring-glass-border' : 'zs-card',
    sheen && 'zs-sheen',
    (interactive || href) && 'zs-card-interactive',
    href && 'block',
    PADDING[padding],
    className,
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return <div className={classes}>{children}</div>
}

/** Header row for a card: title, optional description, optional trailing slot. */
export function CardHeader({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold text-fg">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[13px] leading-relaxed text-fg-subtle">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/** Full-bleed divider that ignores the card's horizontal padding. */
export function CardDivider({ className }: { className?: string }) {
  return <hr className={cn('-mx-5 my-5 border-t border-line sm:-mx-6', className)} />
}
