import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 })

    const { getAnnotations } = await import('@/actions/portfolio-actions')
    const annotations = await getAnnotations(studentId)
    return NextResponse.json(annotations)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { addAnnotation } = await import('@/actions/portfolio-actions')

    if (body.action === 'delete') {
      await (await import('@/actions/portfolio-actions')).deleteAnnotation(body.annotationId)
      return NextResponse.json({ success: true })
    }

    if (!body.studentId || !body.annotationText) {
      return NextResponse.json({ error: 'studentId and annotationText required' }, { status: 400 })
    }

    const annotation = await addAnnotation(body.studentId, body.annotationText)
    return NextResponse.json(annotation, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const annotationId = searchParams.get('annotationId')
    if (!annotationId) return NextResponse.json({ error: 'annotationId required' }, { status: 400 })

    const { deleteAnnotation } = await import('@/actions/portfolio-actions')
    await deleteAnnotation(annotationId)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
