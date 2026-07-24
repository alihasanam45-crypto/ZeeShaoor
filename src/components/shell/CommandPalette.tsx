'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CornerDownLeft, Search } from 'lucide-react'
import type { NavSection } from './types'
import { cn } from '@/components/ui/cn'

/**
 * ⌘K / Ctrl+K navigator.
 *
 * Previously this existed only in the admin header. Teachers and students had
 * no way to jump between the 20–30 routes in their own portals, so it now ships
 * with the shared shell for every role.
 *
 * Matching is a lightweight subsequence scorer rather than `includes`, so "lspl"
 * finds "Lesson Planner" — the behaviour people expect from this control.
 */

type Entry = {
  label: string
  href: string
  hint?: string
  section: string
  icon: React.ElementType
}

/** Returns a score, or -1 when `query` is not a subsequence of `text`. */
function score(text: string, query: string): number {
  const t = text.toLowerCase()
  const q = query.toLowerCase()
  if (!q) return 0

  let ti = 0
  let points = 0
  let streak = 0

  for (const char of q) {
    const found = t.indexOf(char, ti)
    if (found === -1) return -1

    // Reward consecutive matches and matches at word boundaries — that is what
    // makes an acronym like "gd" rank "Grade Distribution" above a scattered hit.
    if (found === ti) streak += 1
    else streak = 0

    const atBoundary = found === 0 || t[found - 1] === ' ' || t[found - 1] === '-'
    points += 1 + streak * 2 + (atBoundary ? 4 : 0)
    ti = found + 1
  }

  // Prefer shorter labels when scores are otherwise close.
  return points - t.length * 0.05
}

export default function CommandPalette({
  nav,
  open,
  onOpenChange,
}: {
  nav: NavSection[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const entries = useMemo<Entry[]>(
    () =>
      nav.flatMap((section) =>
        section.items.map((item) => ({
          label: item.label,
          href: item.href,
          hint: item.hint,
          section: section.heading,
          icon: item.icon,
        })),
      ),
    [nav],
  )

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return entries

    return entries
      .map((entry) => {
        const best = Math.max(
          score(entry.label, q),
          score(entry.section, q) - 2,
          entry.hint ? score(entry.hint, q) - 4 : -1,
        )
        return { entry, best }
      })
      .filter((r) => r.best >= 0)
      .sort((a, b) => b.best - a.best)
      .map((r) => r.entry)
  }, [entries, query])

  const close = useCallback(() => {
    onOpenChange(false)
    setQuery('')
    setHighlighted(0)
  }, [onOpenChange])

  const navigate = useCallback(
    (href: string) => {
      close()
      router.push(href)
    },
    [close, router],
  )

  // Global shortcut. Registered once, regardless of open state.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => setHighlighted(0), [query])

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    if (!open) return
    listRef.current?.children[highlighted]?.scrollIntoView({ block: 'nearest' })
  }, [highlighted, open])

  // Lock background scroll while the overlay is up.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-scrim p-4 pt-[12vh] backdrop-blur-sm animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-surface-overlay shadow-overlay ring-1 ring-inset ring-line animate-scale-in"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-fg-faint" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                close()
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                setHighlighted((h) => (results.length ? (h + 1) % results.length : 0))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setHighlighted((h) =>
                  results.length ? (h - 1 + results.length) % results.length : 0,
                )
              } else if (e.key === 'Enter' && results[highlighted]) {
                e.preventDefault()
                navigate(results[highlighted].href)
              }
            }}
            placeholder="Jump to any page…"
            aria-label="Search pages"
            aria-controls="command-palette-results"
            className="h-14 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-faint focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded-md bg-surface-inset px-1.5 py-0.5 font-mono text-[10px] text-fg-faint ring-1 ring-inset ring-line sm:block">
            Esc
          </kbd>
        </div>

        <ul
          ref={listRef}
          id="command-palette-results"
          role="listbox"
          className="zs-scroll-hidden max-h-[22rem] overflow-y-auto p-2"
        >
          {results.length === 0 && (
            <li className="px-3 py-10 text-center text-sm text-fg-subtle">
              No pages match &ldquo;{query}&rdquo;
            </li>
          )}

          {results.map((entry, i) => {
            const Icon = entry.icon
            const active = i === highlighted
            return (
              <li key={entry.href} role="option" aria-selected={active}>
                <button
                  onClick={() => navigate(entry.href)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                    active ? 'bg-accent-soft text-accent-text' : 'text-fg-muted',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-fg-faint" aria-hidden />
                  <span className="flex-1 truncate font-medium">{entry.label}</span>
                  <span className="hidden shrink-0 text-[10px] uppercase tracking-wider text-fg-faint sm:block">
                    {entry.section}
                  </span>
                  {active && (
                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
