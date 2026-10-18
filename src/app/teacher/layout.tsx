import type { ReactNode } from 'react'
import PortalShell from '@/components/shell/PortalShell'
import { requirePortal } from '@/lib/security/page-guard'

/**
 * Teacher portal frame.
 *
 * Previously this hardcoded `bg-[#0a0a14]` around a dark-only sidebar while the
 * pages inside were hardcoded light — a black rail against white content, with
 * no response to the theme at all. It now uses the shared shell and the token
 * layer, so light and dark are both correct.
 */
export default async function TeacherLayout({ children }: { children: ReactNode }) {
  // Mirrors the proxy's portal ownership exactly: one role, one portal.
  await requirePortal('teacher')

  return (
    <PortalShell
      brand={{ title: 'ZeeShaoor.pk', subtitle: 'Teacher Portal', href: '/teacher' }}
      portal="teacher"
      role="Teacher"
      sidebarFooter={
        <p className="text-[10px] leading-relaxed text-fg-faint">
          Awakening Intellect, Anchoring Truth
        </p>
      }
    >
      {children}
    </PortalShell>
  )
}
