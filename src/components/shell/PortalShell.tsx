'use client'

import { signOut, useSession } from 'next-auth/react'
import type { ReactNode } from 'react'
import AppShell from './AppShell'
import { ADMIN_NAV, STUDENT_NAV, TEACHER_NAV } from './nav'
import type { Brand, NavSection } from './types'

/**
 * Portal navigation is selected here, on the client, by key.
 *
 * The nav lists cannot be passed down as props: each item's `icon` is a React
 * component, and a server layout may only hand a client component plain,
 * serializable values. Passing the arrays across that boundary logs
 * "Only plain objects can be passed to Client Components" once per item.
 * Sending a short string and resolving it client-side keeps the boundary
 * clean — and keeps the icon components out of the RSC payload entirely.
 */
const NAV_BY_PORTAL: Record<PortalKey, NavSection[]> = {
  teacher: TEACHER_NAV,
  student: STUDENT_NAV,
  admin: ADMIN_NAV,
}

export type PortalKey = 'teacher' | 'student' | 'admin'

/**
 * Client wrapper that supplies the signed-in user to `AppShell`.
 *
 * Keeping this separate lets each portal's `layout.tsx` stay a server
 * component — only the parts that genuinely need session state and event
 * handlers ship to the browser.
 */
export default function PortalShell({
  brand,
  portal,
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
  /** Which portal's navigation to render. Resolved client-side — see above. */
  portal: PortalKey
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
      nav={NAV_BY_PORTAL[portal]}
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
