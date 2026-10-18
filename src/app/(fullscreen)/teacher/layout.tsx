import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { requirePortal } from '@/lib/security/page-guard'

export const metadata: Metadata = {
  title: 'Paper Preview',
}

/**
 * Full-screen teacher frame — a blank canvas, no portal chrome.
 *
 * This segment lives in the `(fullscreen)` route group rather than under
 * `src/app/teacher/`, which is the whole point: layouts are inherited by
 * file-system position, so a route parked here resolves to `/teacher/...` in
 * the URL while skipping `src/app/teacher/layout.tsx` — and with it the
 * PortalShell sidebar, the sticky header and the command palette.
 *
 * Because that layout is skipped, its `requirePortal('teacher')` call is
 * skipped too. The guard is repeated here deliberately: the proxy is not the
 * only line of defence, and a full-screen route that renders a teacher's
 * generated paper must not be reachable by a student or a signed-out visitor.
 */
export default async function TeacherFullscreenLayout({ children }: { children: ReactNode }) {
  await requirePortal('teacher')

  return (
    // `h-dvh` (not `h-screen`) so mobile browser chrome does not crop the
    // bottom of the canvas, and `w-full` rather than `w-screen` because
    // `100vw` includes the scrollbar gutter and would push a phantom
    // horizontal scroll onto the page.
    //
    // `#main-content` is the target of the root layout's skip link. AppShell
    // normally owns that id; on this route nothing else does, so it moves here.
    <main
      id="main-content"
      className="zs-fullscreen relative flex h-dvh w-full flex-col overflow-hidden bg-bg text-fg"
    >
      {children}
    </main>
  )
}
