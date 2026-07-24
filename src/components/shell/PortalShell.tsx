'use client'

import { signOut, useSession } from 'next-auth/react'
import type { ReactNode } from 'react'
import AppShell from './AppShell'
import type { Brand, NavSection } from './types'

/**
 * Client wrapper that supplies the signed-in user to `AppShell`.
 *
 * Keeping this separate lets each portal's `layout.tsx` stay a server
 * component — only the parts that genuinely need session state and event
 * handlers ship to the browser.
 */
export default function PortalShell({
  brand,
  nav,
  role,
  children,
  headerActions,
  sidebarFooter,
  overlays,
  rootClassName,
  rootData,
  /** Server-resolved display name, used until the client session hydrates. */
  fallbackName,
}: {
  brand: Brand
  nav: NavSection[]
  role: string
  children: ReactNode
  headerActions?: ReactNode
  sidebarFooter?: ReactNode
  overlays?: ReactNode
  rootClassName?: string
  rootData?: Record<string, string>
  fallbackName?: string
}) {
  const { data: session } = useSession()

  // The JWT carries only id/role/email, so a display name is derived from the
  // email local-part — the same rule the admin header used previously.
  const name =
    session?.user?.name ||
    fallbackName ||
    session?.user?.email?.split('@')[0] ||
    'Account'

  return (
    <AppShell
      brand={brand}
      nav={nav}
      user={{ name, role }}
      headerActions={headerActions}
      sidebarFooter={sidebarFooter}
      overlays={overlays}
      rootClassName={rootClassName}
      rootData={rootData}
      onSignOut={() => signOut({ callbackUrl: '/login' })}
    >
      {children}
    </AppShell>
  )
}
