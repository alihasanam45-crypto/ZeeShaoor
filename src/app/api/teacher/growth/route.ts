import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { getMyPD, getMyJournalEntries } = await import('@/actions/growth-actions')
    const [pd, journal] = await Promise.all([getMyPD(), getMyJournalEntries()])

    return NextResponse.json({ pd, journal })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { action, ...data } = body

    const { upsertPD, toggleGoal, addJournalEntry, deleteJournalEntry } = await import('@/actions/growth-actions')

    switch (action) {
      case 'update-pd':
        return NextResponse.json(await upsertPD(data))
      case 'toggle-goal':
        return NextResponse.json(await toggleGoal(data.goalIndex))
      case 'add-journal':
        return NextResponse.json(await addJournalEntry(data.reflectionText), { status: 201 })
      case 'delete-journal':
        await deleteJournalEntry(data.entryId)
        return NextResponse.json({ success: true })
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
