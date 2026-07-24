'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isNavItemActive, type NavSection } from './types'
import { cn } from '@/components/ui/cn'

/**
 * Sidebar navigation list.
 *
 * In `collapsed` mode the rail keeps icons only; labels are still rendered for
 * assistive tech via `sr-only` plus a native `title` tooltip, so collapsing is
 * a visual affordance and never removes information.
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

  return (
    <nav
      aria-label="Main"
      className={cn('zs-scroll-hidden flex-1 overflow-y-auto py-4', collapsed ? 'px-2' : 'px-3')}
    >
      {nav.map((section) => (
        <div key={section.heading} className="mb-5 last:mb-0">
          {collapsed ? (
            // A divider stands in for the heading so grouping survives collapse.
            <hr className="mx-2 mb-2 border-t border-line-subtle first:hidden" aria-hidden />
          ) : (
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
              {section.heading}
            </p>
          )}

          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isNavItemActive(item, pathname)
              const Icon = item.icon

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
                        'h-[18px] w-[18px] shrink-0 transition-colors',
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
      ))}
    </nav>
  )
}
