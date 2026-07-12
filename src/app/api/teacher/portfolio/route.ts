import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const q = searchParams.get('q')
    const classId = searchParams.get('classId')

    const { compilePortfolio, searchStudents } = await import('@/actions/portfolio-actions')

    if (studentId) {
      const portfolio = await compilePortfolio(studentId)
      return NextResponse.json(portfolio)
    }

    if (q) {
      const students = await searchStudents(q, classId ?? undefined)
      return NextResponse.json(students)
    }

    return NextResponse.json({ error: 'studentId or q required' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
