import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { deleteHomeworkTask } = await import('@/actions/homework-actions')
    await deleteHomeworkTask(id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
