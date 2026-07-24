import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'
import Spinner from './Spinner'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon'

/* Every variant carries its own hover, active and disabled treatment so a
   button never looks "dead" mid-interaction. `active:` uses a 1px translate
   rather than a scale — scaling text causes visible reflow shimmer. */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg shadow-accent hover:bg-accent-hover active:bg-accent-active',
  secondary:
    'bg-surface-inset text-fg shadow-xs ring-1 ring-inset ring-line hover:bg-surface-hover hover:ring-line-strong',
  outline:
    'bg-transparent text-fg ring-1 ring-inset ring-line-strong hover:bg-surface-hover',
  ghost:
    'bg-transparent text-fg-muted hover:bg-surface-hover hover:text-fg',
  danger:
    'bg-danger text-white hover:brightness-110 active:brightness-95',
  success:
    'bg-success text-white hover:brightness-110 active:brightness-95',
}

const SIZES: Record<ButtonSize, string> = {
  xs: 'h-7 gap-1.5 rounded-md px-2.5 text-xs',
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2.5 rounded-xl px-6 text-[15px]',
  icon: 'h-9 w-9 rounded-xl',
}

type BaseProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Shows a spinner, disables interaction and marks the control busy. */
  loading?: boolean
  /** Icon rendered before the label. */
  leadingIcon?: ReactNode
  /** Icon rendered after the label. */
  trailingIcon?: ReactNode
  fullWidth?: boolean
  className?: string
  children?: ReactNode
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined
  }

type ButtonAsLink = BaseProps & {
  /** When present the control renders as a Next.js <Link>. */
  href: string
  target?: string
  rel?: string
  prefetch?: boolean
  onClick?: () => void
}

export type ButtonProps = ButtonAsButton | ButtonAsLink

const BASE =
  'relative inline-flex select-none items-center justify-center font-medium ' +
  'transition-[background-color,box-shadow,color,transform] duration-150 ' +
  'active:translate-y-px ' +
  'disabled:pointer-events-none disabled:opacity-50 ' +
  'aria-disabled:pointer-events-none aria-disabled:opacity-50'

/**
 * The primary action primitive.
 *
 * Renders a `<button>` by default, or a Next.js `<Link>` when `href` is set —
 * navigation and actions share one visual language without callers having to
 * hand-copy button classes onto anchors (the single most common source of
 * inconsistency in the previous code).
 */
export default function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    leadingIcon,
    trailingIcon,
    fullWidth,
    className,
    children,
    ...rest
  } = props

  const classes = cn(
    BASE,
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  )

  // Keep the label in place while loading: the spinner replaces the leading
  // icon slot instead of the whole label, so the button never changes width.
  const content = (
    <>
      {loading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} label={null} />
      ) : (
        leadingIcon
      )}
      {children}
      {!loading && trailingIcon}
    </>
  )

  if ('href' in props && props.href !== undefined) {
    const { href, ...linkRest } = rest as Omit<ButtonAsLink, keyof BaseProps>
    return (
      <Link href={href} className={classes} aria-busy={loading || undefined} {...linkRest}>
        {content}
      </Link>
    )
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button
      type={buttonRest.type ?? 'button'}
      aria-busy={loading || undefined}
      {...buttonRest}
      disabled={buttonRest.disabled || loading}
      className={classes}
    >
      {content}
    </button>
  )
}
