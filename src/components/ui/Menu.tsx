'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from './cn'

export type MenuAction = {
  type?: 'item'
  label: string
  icon?: ReactNode
  onSelect?: () => void
  href?: string
  tone?: 'default' | 'danger'
  disabled?: boolean
}
export type MenuSeparator = { type: 'separator' }
export type MenuLabel = { type: 'label'; label: string }

export type MenuItem = MenuAction | MenuSeparator | MenuLabel

const isAction = (item: MenuItem): item is MenuAction =>
  item.type === undefined || item.type === 'item'

/**
 * Accessible dropdown menu.
 *
 * Hand-rolled rather than pulled from a UI kit to avoid adding a dependency,
 * but it implements the parts that matter:
 *  - closes on Escape, outside click and route-triggering selection
 *  - returns focus to the trigger on close, so keyboard users are not dumped
 *    at the top of the document
 *  - roving focus through items with ArrowUp/ArrowDown/Home/End
 *  - `aria-expanded` / `aria-haspopup` on the trigger, `role="menu"` on the list
 */
export default function Menu({
  trigger,
  items,
  align = 'end',
  className,
  menuClassName,
}: {
  trigger: (props: { open: boolean }) => ReactNode
  items: MenuItem[]
  align?: 'start' | 'end'
  className?: string
  menuClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const menuId = useId()

  // Indices of items that can actually receive focus.
  const focusable = items
    .map((item, i) => (isAction(item) && !item.disabled ? i : -1))
    .filter((i) => i !== -1)

  const close = (restoreFocus = true) => {
    setOpen(false)
    setActiveIndex(-1)
    if (restoreFocus) triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open && activeIndex >= 0) itemRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  const moveFocus = (direction: 1 | -1 | 'first' | 'last') => {
    if (focusable.length === 0) return
    if (direction === 'first') return setActiveIndex(focusable[0])
    if (direction === 'last') return setActiveIndex(focusable[focusable.length - 1])

    const current = focusable.indexOf(activeIndex)
    const next = current === -1 ? 0 : (current + direction + focusable.length) % focusable.length
    setActiveIndex(focusable[next])
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          setOpen((v) => !v)
          setActiveIndex(-1)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
            moveFocus('first')
          }
        }}
      >
        {trigger({ open })}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              moveFocus(1)
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              moveFocus(-1)
            } else if (e.key === 'Home') {
              e.preventDefault()
              moveFocus('first')
            } else if (e.key === 'End') {
              e.preventDefault()
              moveFocus('last')
            } else if (e.key === 'Tab') {
              close(false)
            }
          }}
          className={cn(
            'absolute z-50 mt-2 min-w-[13rem] origin-top overflow-hidden rounded-xl bg-surface-overlay p-1 shadow-overlay ring-1 ring-inset ring-line',
            'animate-slide-down',
            align === 'end' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {items.map((item, i) => {
            if (item.type === 'separator') {
              return <hr key={i} className="my-1 border-t border-line" />
            }

            if (item.type === 'label') {
              return (
                <p
                  key={i}
                  className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-fg-faint"
                >
                  {item.label}
                </p>
              )
            }

            const entry: MenuAction = item
            const classes = cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors',
              entry.disabled
                ? 'cursor-not-allowed text-fg-faint'
                : entry.tone === 'danger'
                  ? 'text-danger-text hover:bg-danger-soft'
                  : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
            )

            const content = (
              <>
                {entry.icon && <span className="shrink-0 text-fg-faint">{entry.icon}</span>}
                <span className="truncate">{entry.label}</span>
              </>
            )

            if (entry.href && !entry.disabled) {
              return (
                <Link
                  key={i}
                  href={entry.href}
                  role="menuitem"
                  tabIndex={activeIndex === i ? 0 : -1}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  onClick={() => close(false)}
                  className={classes}
                >
                  {content}
                </Link>
              )
            }

            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                disabled={entry.disabled}
                tabIndex={activeIndex === i ? 0 : -1}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                onClick={() => {
                  if (entry.disabled) return
                  entry.onSelect?.()
                  close(false)
                }}
                className={classes}
              >
                {content}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
