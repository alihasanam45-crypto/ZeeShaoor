'use client'

import { useId } from 'react'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from './cn'

/* Shared field chrome. Focus is a ring rather than a border-colour change so
   the control does not shift by a pixel when focused. */
const FIELD =
  'w-full rounded-xl bg-surface-inset text-sm text-fg placeholder:text-fg-faint ' +
  'ring-1 ring-inset ring-line transition-shadow ' +
  'hover:ring-line-strong ' +
  'focus:outline-none focus:ring-2 focus:ring-accent ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

const INVALID = 'ring-danger focus:ring-danger'

type FieldShellProps = {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  className?: string
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode
}

/**
 * Wraps a control with its label, hint and error message, and wires up the
 * `id` / `aria-describedby` / `aria-invalid` relationships so screen readers
 * announce the error together with the field.
 */
function FieldShell({
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldShellProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const invalid = Boolean(error)

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-medium text-fg-muted">
          {label}
          {required && (
            <span className="ml-0.5 text-danger" aria-hidden>
              *
            </span>
          )}
        </label>
      )}

      {children({ id, describedBy, invalid })}

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger-text">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-fg-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  leadingIcon?: ReactNode
  trailingSlot?: ReactNode
  wrapperClassName?: string
}

export function Input({
  label,
  hint,
  error,
  leadingIcon,
  trailingSlot,
  wrapperClassName,
  className,
  required,
  ...rest
}: InputProps) {
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          {leadingIcon && (
            <span
              className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-fg-faint"
              aria-hidden
            >
              {leadingIcon}
            </span>
          )}
          <input
            id={id}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              FIELD,
              'h-10 px-3.5',
              leadingIcon ? 'pl-10' : null,
              trailingSlot ? 'pr-10' : null,
              invalid && INVALID,
              className,
            )}
            {...rest}
          />
          {trailingSlot && (
            <span className="absolute right-3 top-1/2 flex -translate-y-1/2 text-fg-faint">
              {trailingSlot}
            </span>
          )}
        </div>
      )}
    </FieldShell>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  wrapperClassName?: string
}

export function Textarea({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  required,
  rows = 4,
  ...rest
}: TextareaProps) {
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(FIELD, 'resize-y px-3.5 py-2.5 leading-relaxed', invalid && INVALID, className)}
          {...rest}
        />
      )}
    </FieldShell>
  )
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  wrapperClassName?: string
}

/**
 * Native select, styled to match. Native is deliberate: on mobile it opens the
 * platform picker, which beats any custom listbox for long option lists like
 * chapter and subject selection.
 */
export function Select({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  required,
  children,
  ...rest
}: SelectProps) {
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={wrapperClassName}
    >
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            id={id}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              FIELD,
              'h-10 cursor-pointer appearance-none px-3.5 pr-10',
              invalid && INVALID,
              className,
            )}
            {...rest}
          >
            {children}
          </select>
          <svg
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden
          >
            <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </FieldShell>
  )
}

export default Input
