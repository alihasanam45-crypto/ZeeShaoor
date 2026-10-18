import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') ?? undefined
    const classId = searchParams.get('classId') ?? undefined

    const { detectAtRiskStudents, getInterventions } = await import('@/actions/intervention-actions')

    if (searchParams.get('scan') === 'true') {
      const flagged = await detectAtRiskStudents(classId)
      return NextResponse.json({ flagged, count: flagged.length })
    }

    const interventions = await getInterventions(statusFilter)
    return NextResponse.json(interventions)
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

    const {
      detectAtRiskStudents,
      generateAiRecommendation,
      saveIntervention,
      resolveIntervention,
      updateInterventionStatus,
    } = await import('@/actions/intervention-actions')

    switch (action) {
      case 'scan-and-save': {
        const flagged = await detectAtRiskStudents(data.classId)
        const results = []
        for (const student of flagged) {
          const recommendation = await generateAiRecommendation(student)
          const saved = await saveIntervention(student, recommendation)
          results.push(saved)
        }
        return NextResponse.json({ interventions: results, count: results.length })
      }
      case 'generate-recommendation': {
        const flagged = await detectAtRiskStudents(data.classId)
        const student = flagged.find((f) => f.studentId === data.studentId)
        if (!student) return NextResponse.json({ error: 'Student not flagged' }, { status: 404 })
        const recommendation = await generateAiRecommendation(student)
        return NextResponse.json({ recommendation })
      }
      case 'save': {
        const recommendation = await generateAiRecommendation(data.student)
        const saved = await saveIntervention(data.student, recommendation)
        return NextResponse.json(saved, { status: 201 })
      }
      case 'resolve':
        return NextResponse.json(await resolveIntervention(data.interventionId))
      case 'update-status':
        return NextResponse.json(await updateInterventionStatus(data.interventionId, data.status))
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
