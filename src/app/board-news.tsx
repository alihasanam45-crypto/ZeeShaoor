import { AlertCircle, ArrowUpRight, Newspaper } from 'lucide-react'
import { BOARD_SOURCES, type BoardSource } from './landing-content'

/* Revalidate on the server every 30 minutes. */
export const revalidate = 1800

export interface BoardNewsItem {
  id: string
  title: string
  board: string
  publishedAt?: string
  excerpt?: string
  url: string
}

/* ------------------------------------------------------------------
   Only https URLs on the configured official board hosts are allowed
   through. Anything else is dropped rather than rendered.
   ------------------------------------------------------------------ */
const OFFICIAL_HOSTS = new Set(
  BOARD_SOURCES.map((s) => {
    try {
      return new URL(s.url).hostname.replace(/^www\./, '')
    } catch {
      return ''
    }
  }).filter(Boolean),
)

export function isOfficialUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    return u.protocol === 'https:' && OFFICIAL_HOSTS.has(u.hostname.replace(/^www\./, ''))
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------
   fetchBoardNews
   Server-side only, with a hard timeout and graceful failure.

   NOTE: no board is parsed yet. Until a real parser exists for a given
   board, this returns [] for it and the UI falls back to official
   source cards — which is honest, rather than pretending the feed is
   live. Add a parser per board below and it starts rendering items.
   ------------------------------------------------------------------ */
async function fetchFromSource(source: BoardSource): Promise<BoardNewsItem[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)

  try {
    // TODO: replace with a real parser for this board's notices page.
    // const res = await fetch(source.url, {
    //   signal: controller.signal,
    //   next: { revalidate },
    //   headers: { 'user-agent': 'ZeeShaoorBot/1.0' },
    // })
    // if (!res.ok) return []
    // return parseNotices(await res.text(), source)
    return []
  } catch {
    return []
  } finally {
    clearTimeout(timeout)
  }
}

export async function getBoardNews(): Promise<{ items: BoardNewsItem[]; updatedAt: string }> {
  const results = await Promise.allSettled(BOARD_SOURCES.map(fetchFromSource))

  const items = results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .filter((i) => isOfficialUrl(i.url))

  // deduplicate by normalised title + board
  const seen = new Set<string>()
  const unique = items.filter((i) => {
    const key = `${i.board}::${i.title.trim().toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // latest first; items with no date sink to the bottom
  unique.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return tb - ta
  })

  return { items: unique.slice(0, 8), updatedAt: new Date().toISOString() }
}

export default async function BoardNewsSection() {
  const { items, updatedAt } = await getBoardNews()

  return (
    <div className="zs-panel">
      <div className="zs-panel-head">
        <span className="zs-panel-title">
          <Newspaper aria-hidden /> Board news
        </span>
        <span className="zs-mono">
          Checked{' '}
          <time dateTime={updatedAt}>
            {new Date(updatedAt).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </span>
      </div>

      {items.length > 0 ? (
        <ul className="zs-news-list">
          {items.map((n) => (
            <li key={n.id}>
              <a href={n.url} target="_blank" rel="noopener noreferrer">
                <span className="zs-news-body">
                  <strong>{n.title}</strong>
                  <em>
                    {n.board}
                    {n.publishedAt
                      ? ` · ${new Date(n.publishedAt).toLocaleDateString('en-GB')}`
                      : ''}
                  </em>
                  {n.excerpt && <span className="zs-news-ex">{n.excerpt}</span>}
                </span>
                <ArrowUpRight aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <p className="zs-empty">
            <AlertCircle aria-hidden />
            No official board updates are available right now. The official notice pages are
            linked below.
          </p>
          <ul className="zs-news-list">
            {BOARD_SOURCES.map((s) => (
              <li key={s.board}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  <span className="zs-news-body">
                    <strong>{s.board}</strong>
                    <em>{s.region} · official website</em>
                  </span>
                  <ArrowUpRight aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}