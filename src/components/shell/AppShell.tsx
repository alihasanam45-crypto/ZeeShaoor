'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Menu as MenuIcon,
  Search,
  X,
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { cn } from '@/components/ui/cn'
import Menu from '@/components/ui/Menu'
import CommandPalette from './CommandPalette'
import SidebarNav from './SidebarNav'
import { isNavItemActive, type AppShellProps } from './types'

const COLLAPSE_KEY = 'zs-sidebar-collapsed'

/**
 * The single application frame for the student, teacher and admin portals.
 *
 * Replaces three divergent layouts. Behaviour:
 *
 *  - ≥1024px  fixed sidebar, collapsible to a 68px icon rail (choice persisted)
 *  - <1024px  off-canvas drawer over a scrim, with scroll lock, Escape to
 *             close, focus moved into the drawer and restored on close
 *  - ⌘K / Ctrl+K opens the command palette in every portal
 *
 * All colours come from the token layer, so both themes work with no `dark:`
 * duplication in this file.
 */
export default function AppShell({
  brand,
  nav,
  children,
  user,
  headerActions,
  sidebarFooter,
  overlays,
  onSignOut,
  rootClassName,
  rootData,
}: AppShellProps) {
  const pathname = usePathname() ?? ''
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const drawerRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Restore the collapse preference after mount — reading localStorage during
  // render would desync server and client HTML.
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1')
    } catch {
      /* private mode */
    }
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      } catch {
        /* private mode */
      }
      return next
    })
  }, [])

  // Close the drawer on navigation so the next page is not hidden behind it.
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Drawer: scroll lock, Escape to close, and focus management.
  useEffect(() => {
    if (!drawerOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)

    // Move focus into the drawer so keyboard and screen-reader users are not
    // left behind on the page underneath.
    const firstLink = drawerRef.current?.querySelector<HTMLElement>('a, button')
    firstLink?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      menuButtonRef.current?.focus()
    }
  }, [drawerOpen])

  // Derive the header's current-section label from the active nav item.
  const currentItem = nav
    .flatMap((section) => section.items)
    .find((item) => isNavItemActive(item, pathname))

  const initials =
    user?.initials ??
    user?.name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()

  const sidebarBody = (inDrawer: boolean) => (
    <>
      {/* Brand */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-line',
          collapsed && !inDrawer ? 'justify-center px-2' : 'gap-3 px-5',
        )}
      >
        <Link
          href={brand.href}
          className="flex min-w-0 items-center gap-3"
          aria-label={`${brand.title} — ${brand.subtitle}`}
        >
          <Image
            src={brand.logoSrc ?? '/logo.png'}
            alt=""
            width={32}
            height={32}
            priority
            className="shrink-0 rounded-lg"
          />
          {(!collapsed || inDrawer) && (
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-bold tracking-tight text-fg">
                {brand.title}
              </span>
              <span className="block truncate text-[10px] font-medium uppercase tracking-wider text-fg-faint">
                {brand.subtitle}
              </span>
            </span>
          )}
        </Link>

        {inDrawer && (
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
            className="ml-auto rounded-lg p-2 text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <X className="h-4.5 w-4.5" aria-hidden />
          </button>
        )}
      </div>

      <SidebarNav
        nav={nav}
        collapsed={collapsed && !inDrawer}
        onNavigate={() => setDrawerOpen(false)}
      />

      {/* Collapse control — desktop only; the drawer is never collapsed. */}
      {!inDrawer && (
        <div className="hidden shrink-0 border-t border-line p-2 lg:block">
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg',
              collapsed && 'justify-center px-2',
            )}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4 shrink-0" aria-hidden />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}

      {sidebarFooter && (!collapsed || inDrawer) && (
        <div className="shrink-0 border-t border-line px-5 py-3">{sidebarFooter}</div>
      )}
    </>
  )

  return (
    <div
      className={cn('flex h-dvh w-full overflow-hidden bg-bg text-fg', rootClassName)}
      {...rootData}
    >
      {/* ---------------- Desktop sidebar ---------------- */}
      <aside
        className={cn(
          'relative z-30 hidden shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-300 ease-out-quint lg:flex',
          collapsed ? 'w-[68px]' : 'w-64 xl:w-72',
        )}
      >
        {sidebarBody(false)}
      </aside>

      {/* ---------------- Mobile drawer ---------------- */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-scrim backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-line bg-surface shadow-overlay animate-slide-down"
          >
            {sidebarBody(true)}
          </div>
        </div>
      )}

      {/* ---------------- Main column ---------------- */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="zs-glass sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-line px-3 sm:px-5">
          <button
            ref={menuButtonRef}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            className="rounded-lg p-2 text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg lg:hidden"
          >
            <MenuIcon className="h-5 w-5" aria-hidden />
          </button>

          {/* Breadcrumb: portal › current section */}
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="hidden truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-faint sm:inline">
              {brand.subtitle}
            </span>
            <span className="hidden text-fg-faint sm:inline" aria-hidden>
              /
            </span>
            <span className="truncate text-sm font-semibold text-fg">
              {currentItem?.label ?? 'Overview'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Full search affordance on desktop, icon-only on small screens. */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden w-56 items-center gap-2.5 rounded-xl bg-surface-inset px-3 py-2 text-[13px] text-fg-faint ring-1 ring-inset ring-line transition-colors hover:ring-line-strong md:flex"
            >
              <Search className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="flex-1 text-left">Search…</span>
              <kbd className="shrink-0 rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] ring-1 ring-inset ring-line">
                ⌘K
              </kbd>
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
              className="rounded-lg p-2 text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg md:hidden"
            >
              <Search className="h-[18px] w-[18px]" aria-hidden />
            </button>

            {headerActions}

            <ThemeToggle />

            {user && (
              <Menu
                align="end"
                trigger={({ open }) => (
                  <span
                    className={cn(
                      'flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors',
                      open ? 'bg-surface-hover' : 'hover:bg-surface-hover',
                    )}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent text-[11px] font-bold text-accent-fg"
                      aria-hidden
                    >
                      {initials}
                    </span>
                    <span className="hidden min-w-0 text-left sm:block">
                      <span className="block truncate text-[13px] font-medium leading-tight text-fg">
                        {user.name}
                      </span>
                      <span className="block truncate text-[10px] leading-tight text-fg-faint">
                        {user.role}
                      </span>
                    </span>
                  </span>
                )}
                items={[
                  { type: 'label', label: user.role },
                  ...(onSignOut
                    ? ([
                        {
                          label: 'Sign out',
                          icon: <LogOut className="h-4 w-4" />,
                          tone: 'danger' as const,
                          onSelect: onSignOut,
                        },
                      ] as const)
                    : []),
                ]}
              />
            )}
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto scroll-smooth">
          {children}
        </main>
      </div>

      <CommandPalette nav={nav} open={paletteOpen} onOpenChange={setPaletteOpen} />
      {overlays}
    </div>
  )
}
