'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { isNavItemActive, type NavSection } from './types'
import { cn } from '@/components/ui/cn'

/** Remembers the last manually-opened group across a reload. Shared across
 *  portals — a heading from one portal simply won't match another's, so
 *  there is nothing to namespace. */
const OPEN_SECTION_KEY = 'zs-sidebar-open-section'

/**
 * Sidebar navigation list.
 *
 * In `collapsed` mode the rail keeps icons only; labels are still rendered for
 * assistive tech via `sr-only` plus a native `title` tooltip, so collapsing is
 * a visual affordance and never removes information.
 *
 * In expanded mode, the first section (Overview) always stays open — it is
 * the flagship shortcut list. Every section after it is an accordion: only
 * one open at a time, so a ~30-item list never has to be scanned in full.
 * Whichever section holds the current page opens automatically, so the
 * active item is never hidden inside a collapsed group.
 */
export default function SidebarNav({
  nav,
  collapsed = false,
  onNavigate,
}: {
  nav: NavSection[]
  collapsed?: boolean
  /** Called after a link activates — used to close the mobile drawer. */
  onNavigate?: () => void
}) {
  const pathname = usePathname() ?? ''
  const [openHeading, setOpenHeading] = useState<string | null>(null)

  useEffect(() => {
    // The section actually holding the current page wins over any saved
    // preference — a page's own nav item must never be hidden.
    const activeSection = nav
      .slice(1)
      .find((section) => section.items.some((item) => isNavItemActive(item, pathname)))

    if (activeSection) {
      setOpenHeading(activeSection.heading)
      try {
        localStorage.setItem(OPEN_SECTION_KEY, activeSection.heading)
      } catch {
        /* private mode — accordion still works for this session */
      }
      return
    }

    try {
      const saved = localStorage.getItem(OPEN_SECTION_KEY)
      if (saved) setOpenHeading(saved)
    } catch {
      /* private mode — starts closed, which is a safe default */
    }
    // Re-run whenever the route changes, so navigating in from elsewhere
    // (e.g. a dashboard quick action) still opens the right group.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  function toggleSection(heading: string) {
    const next = openHeading === heading ? null : heading
    setOpenHeading(next)
    try {
      if (next) localStorage.setItem(OPEN_SECTION_KEY, next)
      else localStorage.removeItem(OPEN_SECTION_KEY)
    } catch {
      /* private mode — toggle still works for this session */
    }
  }

  return (
    <nav
      aria-label="Main"
      className={cn('zs-scroll-hidden flex-1 overflow-y-auto py-4', collapsed ? 'px-2' : 'px-3')}
    >
      {nav.map((section, index) => {
        const alwaysOpen = index === 0
        const open = collapsed || alwaysOpen || openHeading === section.heading

        return (
          <div key={section.heading} className="mb-5 last:mb-0">
            {collapsed ? (
              // A divider stands in for the heading so grouping survives collapse.
              <hr className="mx-2 mb-2 border-t border-line-subtle first:hidden" aria-hidden />
            ) : alwaysOpen ? (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
                {section.heading}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => toggleSection(section.heading)}
                aria-expanded={open}
                className="mb-1.5 flex w-full items-center justify-between rounded-lg px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-faint transition-colors hover:text-fg-subtle"
              >
                {section.heading}
                <ChevronDown
                  className={cn('h-3 w-3 shrink-0 transition-transform duration-200', open && 'rotate-180')}
                  aria-hidden
                />
              </button>
            )}

            <div
              className={cn(
                collapsed || alwaysOpen
                  ? undefined
                  : cn('grid transition-[grid-template-rows] duration-200 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'),
              )}
            >
              <div className={collapsed || alwaysOpen ? undefined : 'overflow-hidden'}>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isNavItemActive(item, pathname)
                    const Icon = item.icon

                    if (item.disabled) {
                      return (
                        <li key={item.label}>
                          <div
                            title={item.hint}
                            className={cn(
                              'flex cursor-default items-center rounded-xl text-[13.5px] font-medium text-fg-faint opacity-60',
                              collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2',
                            )}
                          >
                            <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden />
                            <span className={cn('truncate', collapsed && 'zs-sr-only')}>{item.label}</span>
                            {!collapsed && (
                              <span className="ml-auto shrink-0 rounded-full bg-surface-inset px-1.5 py-0.5 text-[10px] font-semibold">
                                Soon
                              </span>
                            )}
                          </div>
                        </li>
                      )
                    }

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          aria-current={active ? 'page' : undefined}
                          title={collapsed ? item.label : item.hint}
                          className={cn(
                            'group relative flex items-center rounded-xl text-[13.5px] font-medium transition-colors',
                            collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2',
                            active
                              ? 'bg-accent-soft text-accent-text'
                              : 'text-fg-subtle hover:bg-surface-hover hover:text-fg',
                          )}
                        >
                          {/* Active marker: a left bar rather than a colour change alone,
                              so current position survives greyscale and low vision. */}
                          {active && (
                            <span
                              className={cn(
                                'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent',
                                collapsed && 'left-0',
                              )}
                              aria-hidden
                            />
                          )}

                          <Icon
                            className={cn(
                              'h-4.5 w-4.5 shrink-0 transition-colors',
                              active ? 'text-accent' : 'text-fg-faint group-hover:text-fg-muted',
                            )}
                            aria-hidden
                          />

                          <span className={cn('truncate', collapsed && 'zs-sr-only')}>
                            {item.label}
                          </span>

                          {!collapsed && item.badge && (
                            <span
                              className={cn(
                                'ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                item.badge.tone === 'danger' && 'bg-danger-soft text-danger-text',
                                item.badge.tone === 'warning' && 'bg-warning-soft text-warning-text',
                                item.badge.tone === 'success' && 'bg-success-soft text-success-text',
                                (!item.badge.tone || item.badge.tone === 'accent') &&
                                  'bg-accent-soft text-accent-text',
                              )}
                            >
                              {item.badge.label}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
