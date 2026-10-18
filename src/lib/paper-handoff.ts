/**
 * Generator → preview hand-off.
 *
 * The generated paper is too large for a query string and is not addressable
 * server-side (it is a one-shot randomised draw, not a saved record), so it
 * travels through `sessionStorage`: per-tab, survives a reload and a soft
 * navigation, and is gone when the tab closes.
 *
 * Previously both sides open-coded `sessionStorage.getItem('zeeshaoor_paper')`
 * and `JSON.parse` with no shape agreement between them — which is exactly how
 * the writer once wrote `generatorData` while the reader looked for
 * `zeeshaoor_paper` and every successful generation silently bounced back.
 * One module now owns the key, the shape and the version.
 */

/** Where the full-screen preview lives. Imported rather than typed as a literal. */
export const PAPER_PREVIEW_ROUTE = '/teacher/preview'

const KEY = 'zeeshaoor_paper'
const VERSION = 2

export interface PaperQuestionSet {
  mcqs: unknown[]
  shortQuestions: unknown[]
  longQuestions: unknown[]
}

export interface PaperMetadata {
  class: string
  subject: string
  chapter: string
  totalQuestions: number
}

export interface PaperHandoff {
  version: number
  /** Epoch ms — lets the preview show how fresh the draw is. */
  createdAt: number
  paperData: PaperQuestionSet
  metadata: PaperMetadata
  /** The exact payload sent to /api/generator, so the preview can re-run it. */
  config: unknown
  /** Raw generator response, kept for fields the renderer does not consume yet. */
  result?: unknown
}

export type PaperHandoffInput = Omit<PaperHandoff, 'version' | 'createdAt'>

/**
 * Returns false instead of throwing: a quota failure must surface as a toast on
 * the generator, not as an unhandled rejection that leaves the button spinning.
 */
export function savePaperHandoff(input: PaperHandoffInput): boolean {
  if (typeof window === 'undefined') return false
  try {
    const payload: PaperHandoff = { version: VERSION, createdAt: Date.now(), ...input }
    window.sessionStorage.setItem(KEY, JSON.stringify(payload))
    emitChange()
    return true
  } catch {
    return false
  }
}

export function loadPaperHandoff(): PaperHandoff | null {
  if (typeof window === 'undefined') return null
  let parsed: unknown
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return null
    parsed = JSON.parse(raw)
  } catch {
    // Corrupt entry — drop it so the next generation starts clean. Removed
    // directly rather than through `clearPaperHandoff`, because this runs
    // inside `getPaperHandoffSnapshot` and must not notify subscribers
    // mid-render.
    try {
      window.sessionStorage.removeItem(KEY)
    } catch {
      /* private mode */
    }
    return null
  }

  if (!parsed || typeof parsed !== 'object') return null
  const candidate = parsed as Partial<PaperHandoff>
  const data = candidate.paperData
  if (!data || !Array.isArray(data.mcqs) || !Array.isArray(data.shortQuestions) || !Array.isArray(data.longQuestions)) {
    return null
  }
  // An empty paper is not a paper; treat it the same as no hand-off at all.
  if (data.mcqs.length + data.shortQuestions.length + data.longQuestions.length === 0) return null

  return {
    version: candidate.version ?? 1,
    createdAt: candidate.createdAt ?? 0,
    paperData: data,
    metadata: candidate.metadata ?? { class: '', subject: '', chapter: '', totalQuestions: 0 },
    config: candidate.config,
    result: candidate.result,
  }
}

export function clearPaperHandoff(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    /* private mode */
  }
  emitChange()
}

/* ---------------------------------------------------------------------------
   useSyncExternalStore adapter.

   The preview reads this at render time rather than assigning it into state
   from an effect — the same shape `AppShell` uses for its collapse preference,
   and the only one the repo's `react-hooks/set-state-in-effect` rule accepts.

   `getPaperHandoffSnapshot` must return a *stable reference* for unchanged
   storage or React re-renders forever, so the parsed object is memoised against
   the raw string it came from.
   ------------------------------------------------------------------------ */
const listeners = new Set<() => void>()
let cachedRaw: string | null | undefined
let cachedValue: PaperHandoff | null = null

function emitChange() {
  cachedRaw = undefined
  listeners.forEach((listener) => listener())
}

export function subscribePaperHandoff(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

export function getPaperHandoffSnapshot(): PaperHandoff | null {
  let raw: string | null = null
  try {
    raw = window.sessionStorage.getItem(KEY)
  } catch {
    raw = null
  }
  if (raw === cachedRaw) return cachedValue
  cachedRaw = raw
  cachedValue = loadPaperHandoff()
  return cachedValue
}

/** No storage on the server — the hydration pass always renders "not read yet". */
export function getPaperHandoffServerSnapshot(): PaperHandoff | null {
  return null
}

/** False during SSR and the hydration render, true once the client takes over. */
export function subscribeNever(): () => void {
  return () => {}
}
