import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Complaint from '@/models/Complaint'

// --------- GET — Fetch all complaints ---------------------------------------------------------------------------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const status   = searchParams.get('status')
    const severity = searchParams.get('severity')
    const category = searchParams.get('category')
    const page     = parseInt(searchParams.get('page')  || '1')
    const limit    = parseInt(searchParams.get('limit') || '20')

    // Build filter
    const filter: Record<string, string> = {}
    if (status   && status   !== 'all') filter.status   = status
    if (severity && severity !== 'all') filter.severity = severity
    if (category && category !== 'all') filter.category = category

    const skip = (page - 1) * limit

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data: complaints,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/admin/complaints error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch complaints' },
      { status: 500 }
    )
  }
}

// --------- POST — Create new complaint ------------------------------------------------------------------------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { category, severity, subject, body: complaintBody, isAnonymous, tags } = body

    // Validation
    if (!category || !severity || !subject || !complaintBody) {
      return NextResponse.json(
        { success: false, error: 'category, severity, subject, body are required' },
        { status: 400 }
      )
    }

    const complaint = await Complaint.create({
      category,
      severity,
      subject,
      body: complaintBody,
      isAnonymous: isAnonymous ?? true,
      tags: tags || [],
    })

    return NextResponse.json(
      { success: true, data: complaint },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/admin/complaints error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create complaint' },
      { status: 500 }
    )
  }
}