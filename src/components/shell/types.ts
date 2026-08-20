import type { ElementType, ReactNode } from 'react'

/**
 * Navigation contract shared by all three portals.
 *
 * The student, teacher and admin sidebars previously each defined their own
 * near-identical section/item shape and their own rendering, which is how they
 * drifted into three different visual languages. They now all feed this one
 * type into `<AppShell>`.
 */
export type NavItem = {
  label: string
  href: string
  icon: ElementType
  /** Short description — shown in the command palette and as a tooltip. */
  hint?: string
  /**
   * Treat descendants of this path as active too. Defaults to `href` for
   * non-index routes; set explicitly when a section root differs from its
   * landing route.
   */
  activePrefix?: string
  /** Exact-match only. Use for portal index routes like `/teacher`. */
  exact?: boolean
  /** Optional trailing count/status chip. */
  badge?: { label: string; tone?: 'accent' | 'danger' | 'warning' | 'success' }
  /** Shown greyed-out, not clickable — a real, planned page with no route yet. */
  disabled?: boolean
}

export type NavSection = {
  heading: string
  items: NavItem[]
  /** When true, the section can be expanded/collapsed in the sidebar. */
  collapsible?: boolean
}

export type Brand = {
  title: string
  /** Portal name, e.g. "Teacher Portal". */
  subtitle: string
  href: string
  logoSrc?: string
}

export type ShellUser = {
  name: string
  role: string
  /** Falls back to the first letter of `name`. */
  initials?: string
}

export type AppShellProps = {
  brand: Brand
  nav: NavSection[]
  children: ReactNode
  user?: ShellUser
  /** Rendered in the header, before the theme toggle. */
  headerActions?: ReactNode
  /** Rendered at the very bottom of the sidebar. */
  sidebarFooter?: ReactNode
  /** Rendered after the shell content — portals/overlays like the AI orb. */
  overlays?: ReactNode
  /** Signs the user out. Omit to hide the item. */
  onSignOut?: () => void
  /**
   * Extra classes on the shell root. Used by the student portal to expose
   * `group/shell`, which page-level widgets target for focus-mode dimming.
   */
  rootClassName?: string
  /**
   * `data-*` attributes on the shell root. The student dashboard's widgets
   * key off `data-focus` via `group-data-[focus=on]/shell:*`.
   */
  rootData?: Record<string, string>
}

/** True when `pathname` should mark `item` as the current page. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href
  const prefix = item.activePrefix ?? item.href
  return pathname === item.href || pathname.startsWith(`${prefix}/`)
}
