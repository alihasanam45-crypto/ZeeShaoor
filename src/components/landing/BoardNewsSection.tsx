import { AlertCircle, ArrowUpRight, FileText } from 'lucide-react'
import { BOARD_SOURCES, type BoardSource } from './landing-content'

/**
 * Server component. Revalidates every 30 minutes through the Next.js data
 * cache. Nothing is scraped on the client.
 *
 * A board with no `feed` configured renders as an official-source link card
 * — the feed is NOT faked. Nothing is ever generated or summarised.
 */
export const revalidate = 1800

interface NewsItem {
  title: string
  board: string
  link: string
  published?: string
}

/** Minimal RSS/Atom item reader. Rejects any link outside the board's host. */
function parseFeed(xml: string, src: BoardSource): NewsItem[] {
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/\1>/gi) ?? []
  const pick = (b: string, tag: string) => {
    const m = b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
    return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim() : ''
  }

  return blocks.flatMap((b) => {
    const title = pick(b, 'title')
    const raw = pick(b, 'link') || (b.match(/<link[^>]+href="([^"]+)"/i)?.[1] ?? '')
    if (!title || !raw) return []

    let link: URL
    try { link = new URL(raw, src.site) } catch { return [] }
    if (link.protocol !== 'https:' || !link.hostname.endsWith(src.host)) return []

    const dateRaw = pick(b, 'pubDate') || pick(b, 'updated') || pick(b, 'published')
    const parsed = dateRaw ? new Date(dateRaw) : null
    const published = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : undefined

    return [{ title, board: src.board, link: link.toString(), published }]
  })
}

async function loadSource(src: BoardSource): Promise<NewsItem[]> {
  if (!src.feed) return []
  try {
    const res = await fetch(src.feed, {
      next: { revalidate },
      signal: AbortSignal.timeout(6000),
      headers: { accept: 'application/rss+xml, application/xml, text/xml' },
    })
    if (!res.ok) return []
    return parseFeed(await res.text(), src).slice(0, 6)
  } catch {
    return [] // timeout / DNS / parse failure — the link card covers this board
  }
}

export async function BoardNewsSection() {
  const results = await Promise.all(BOARD_SOURCES.map(loadSource))

  const seen = new Set<string>()
  const items = results
    .flat()
    .filter((i) => (seen.has(i.link) ? false : (seen.add(i.link), true)))
    .sort((a, b) => (b.published ?? '').localeCompare(a.published ?? ''))
    .slice(0, 8)

  const checkedAt = new Date().toISOString()

  return (
    <div className="zs-two">
      <div className="zs-panel">
        <div className="zs-panel-head">
          <span className="zs-panel-title"><FileText aria-hidden /> Board updates</span>
          <span className="zs-stamp">
            Last checked{' '}
            <time dateTime={checkedAt}>
              {new Date(checkedAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
            </time>
          </span>
        </div>

        {items.length === 0 ? (
          <p className="zs-empty">
            <AlertCircle aria-hidden />
            No official board updates are available right now. The official pages are linked alongside.
          </p>
        ) : (
          <ul className="zs-link-list">
            {items.map((i) => (
              <li key={i.link}>
                <a href={i.link} target="_blank" rel="noopener noreferrer">
                  <span>
                    <strong>{i.title}</strong>
                    <em>
                      {i.board}
                      {i.published && (
                        <> · <time dateTime={i.published}>
                          {new Date(i.published).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                        </time></>
                      )}
                    </em>
                  </span>
                  <ArrowUpRight aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="zs-panel">
        <div className="zs-panel-head">
          <span className="zs-panel-title">Official board pages</span>
        </div>
        <ul className="zs-link-list">
          {BOARD_SOURCES.map((s) => (
            <li key={s.host}>
              <a href={s.site} target="_blank" rel="noopener noreferrer">
                <span>
                  <strong>{s.board}</strong>
                  <em>{s.feed ? 'Updates read automatically' : 'Opens the official website'}</em>
                </span>
                <ArrowUpRight aria-hidden />
              </a>
            </li>
          ))}
        </ul>
        <p className="zs-fineprint">
          Date sheets, results and notices are published by the boards themselves. Always confirm on the
          official page before acting on anything.
        </p>
      </div>
    </div>
  )
}