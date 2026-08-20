import { redirect } from 'next/navigation'
import { PAPER_PREVIEW_ROUTE } from '@/lib/paper-handoff'

/**
 * Legacy paper route.
 *
 * The Paper Engine moved to `(fullscreen)/teacher/preview`, which escapes the
 * portal shell. This path stays only so existing bookmarks and any in-flight
 * client navigation still land on a paper instead of a 404. The redirect is
 * server-side, so there is no flash of the old shell-wrapped layout — and the
 * sessionStorage hand-off is untouched by it.
 */
export default function LegacyPaperPage() {
  redirect(PAPER_PREVIEW_ROUTE)
}
