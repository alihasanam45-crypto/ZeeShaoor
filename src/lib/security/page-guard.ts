import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/options'
import { homeFor } from '@/lib/security/route-policy'
import { auditEscalationAttempt } from '@/lib/security/audit'
import type { UserRole, ZeeTokenPayload } from '@/types/auth'

/**
 * Server-side portal guard for layouts and pages.
 *
 * The proxy already blocks cross-portal navigation, but relying on it alone
 * makes a single matcher typo a full portal exposure. This runs inside the
 * React Server Component tree, where the session is read from the signed
 * cookie directly — so it holds even if the request never passed the proxy.
 *
 * Call from each portal's `layout.tsx`. Layouts render before their pages, so
 * one call covers every route in the segment.
 */
export async function requirePortal(...allowedRoles: UserRole[]): Promise<ZeeTokenPayload> {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user?.id || !user.role) {
    redirect('/login')
  }

  if (!allowedRoles.includes(user.role)) {
    auditEscalationAttempt(user, {
      reason: 'portal_access_denied',
      required: allowedRoles,
      surface: 'layout',
    })
    // Send them to their own portal rather than /login — they *are*
    // authenticated, just not for this area.
    redirect(homeFor(user.role))
  }

  return user
}

/** Session accessor for pages that personalize but do not gate. */
export async function currentUser(): Promise<ZeeTokenPayload | null> {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
}
