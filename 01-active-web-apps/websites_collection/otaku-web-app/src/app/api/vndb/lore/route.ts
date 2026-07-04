/**
 * Proxy to Otaku Librarian VNDB lore endpoint (Phase 3).
 * Librarian: POST /api/vndb/lore on anime_manga_agent :5000
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title')
  if (!title) {
    return Response.json({ success: false, message: 'title query required' }, { status: 400 })
  }

  const librarianUrl = (process.env.LIBRARIAN_URL ?? process.env.NEXT_PUBLIC_LIBRARIAN_URL ?? 'http://localhost:5000').replace(/\/$/, '')

  try {
    const res = await fetch(`${librarianUrl}/api/vndb/lore?title=${encodeURIComponent(title)}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch (e) {
    return Response.json(
      { success: false, message: e instanceof Error ? e.message : 'Librarian unreachable' },
      { status: 502 },
    )
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({})) as { title?: string; id?: number }
  const librarianUrl = (process.env.LIBRARIAN_URL ?? 'http://localhost:5000').replace(/\/$/, '')

  try {
    const res = await fetch(`${librarianUrl}/api/vndb/lore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    return Response.json(await res.json(), { status: res.status })
  } catch (e) {
    return Response.json(
      { success: false, message: e instanceof Error ? e.message : 'Librarian unreachable' },
      { status: 502 },
    )
  }
}
