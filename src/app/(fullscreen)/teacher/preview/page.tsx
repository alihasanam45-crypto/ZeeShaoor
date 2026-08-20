'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import PaperRenderer from '@/components/PaperRenderer'
import {
  getPaperHandoffServerSnapshot,
  getPaperHandoffSnapshot,
  subscribeNever,
  subscribePaperHandoff,
} from '@/lib/paper-handoff'

/**
 * Full-screen paper preview.
 *
 * Renders nothing but the Paper Engine: its own control rail plus the paper
 * canvas, edge to edge. The portal sidebar, header and command palette are
 * absent by construction — see `(fullscreen)/teacher/layout.tsx`.
 *
 * The hand-off is *read* and not cleared, so a browser reload (or a Back →
 * Forward round trip) re-hydrates the same paper instead of bouncing the
 * teacher back to the generator.
 */
export default function PaperPreviewPage() {
  const router = useRouter()

  // Read at render time rather than copied into state from an effect: storage
  // is external state, and an effect would paint an empty frame first.
  const handoff = useSyncExternalStore(
    subscribePaperHandoff,
    getPaperHandoffSnapshot,
    getPaperHandoffServerSnapshot,
  )
  // `handoff === null` means two different things on the two passes — "storage
  // is unreachable because this is the server" and "storage is genuinely
  // empty". Only the second one should redirect.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false)

  useEffect(() => {
    if (hydrated && !handoff) router.replace('/teacher/generator')
  }, [hydrated, handoff, router])

  if (!handoff) {
    const empty = hydrated
    return (
      <div
        role="status"
        aria-label={empty ? 'No paper to preview' : 'Loading paper'}
        className="flex h-full w-full flex-col items-center justify-center gap-4 bg-bg"
      >
        <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-accent" />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-fg-faint">
          {empty ? 'No paper — returning to generator' : 'Loading paper…'}
        </p>
      </div>
    )
  }

  return (
    <PaperRenderer
      paperData={handoff.paperData}
      metadata={handoff.metadata}
      onExit={() => router.push('/teacher/generator')}
    />
  )
}
