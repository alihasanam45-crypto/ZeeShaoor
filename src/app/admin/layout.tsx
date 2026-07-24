import type { ReactNode } from 'react'
import PortalShell from '@/components/shell/PortalShell'
import { ADMIN_NAV } from '@/components/shell/nav'
import { requirePortal } from '@/lib/security/page-guard'

/**
 * Admin console frame.
 *
 * The bespoke AdminSidebar/AdminHeader pair is replaced by the shared shell:
 * the console keeps its ⌘K palette (now available in every portal, not just
 * this one) and gains light-theme support, a mobile drawer and a collapsible
 * rail that it previously lacked.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Second, independent gate behind the proxy — see requirePortal().
  await requirePortal('admin')

  return (
    <PortalShell
      brand={{ title: 'ZeeShaoor.pk', subtitle: 'Admin Console', href: '/admin' }}
      nav={ADMIN_NAV}
      role="Super Admin"
      sidebarFooter={
        <p className="text-[10px] leading-relaxed text-fg-faint">
          Awakening Intellect, Anchoring Truth
          <span className="mt-0.5 block font-mono text-fg-faint/70">
            Neural Learning Matrix v7.0
          </span>
        </p>
      }
    >
      {children}
    </PortalShell>
  )
}
