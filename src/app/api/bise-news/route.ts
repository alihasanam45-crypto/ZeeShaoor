import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      'https://news.google.com/rss/search?q=BISE+Lahore+Pakistan+exam&hl=en-PK&gl=PK&ceid=PK:en',
      { next: { revalidate: 3600 } }
    )
    const xml = await res.text()
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 6)
      .map(match => {
        const c = match[1]
        const title = (c.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || c.match(/<title>(.*?)<\/title>/)?.[1] || '').replace(/&amp;/g,'&')
        const link = c.match(/<link>(.*?)<\/link>/)?.[1] || '#'
        const pubDate = c.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
        const date = pubDate ? new Date(pubDate).toLocaleDateString('en-PK',{year:'numeric',month:'long',day:'numeric'}) : ''
        return { title, link, date }
      })
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] })
  }
}