import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { connectDB } from '@/lib/mongodb'
import Streak from '@/models/Streak'

const MILESTONES = [3, 7, 14, 30, 60, 100]
const TIMEZONE = 'Asia/Karachi'
const LOG_WINDOW_DAYS = 90

// ------ Timezone-safe date helpers (Pakistan time, server location se independent) ------

function getTodayStr(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()) // returns YYYY-MM-DD format directly
}

function getDateNDaysAgo(n: number): string {
  const now = new Date()
  // Pakistan time mein "abhi" nikalo, phir n din peeche jao
  const pkNow = new Date(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(now)
  )
  pkNow.setDate(pkNow.getDate() - n)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' }).format(pkNow)
}

function getDaysBetween(start: string, end: string): string[] {
  const dates: string[] = []
  const s = new Date(start + 'T00:00:00Z')
  const e = new Date(end + 'T00:00:00Z')
  const cur = new Date(s)
  while (cur <= e) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return dates
}

// ------ GET: Streak data fetch ------

export async function GET(req: NextRequest) {
  try {
    const token = (await getToken({ req, secret: process.env.NEXTAUTH_SECRET })) as any
    if (!token || token.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const streak = (await Streak.findOne({ studentId: token.id }).lean()) as any

    if (!streak) {
      return NextResponse.json({
        data: {
          currentStreak: 0,
          longestStreak: 0,
          milestonesReached: [],
          nextMilestone: MILESTONES[0],
          todayActive: false,
          heatmap: [],
          nanoQuizStreak: 0,
          nanoHomeworkStreak: 0,
          nanoNotesStreak: 0,
          totalActiveDays: 0,
        },
      })
    }

    const logs: any[] = streak.logs || []
    const today = getTodayStr()

    // O(1) lookup ke liye Map banao — O(n²) heatmap scan khatam
    const logMap = new Map<string, any>(logs.map(l => [l.date, l]))

    const todayLog = logMap.get(today)

    const sortedDesc = [...logs].sort((a, b) => b.date.localeCompare(a.date))
    let currentStreak = 0
    for (const log of sortedDesc) {
      if (log.isActive) currentStreak++
      else break
    }

    const ninetyDaysAgo = getDateNDaysAgo(LOG_WINDOW_DAYS - 1)
    const dateRange = getDaysBetween(ninetyDaysAgo, today)
    const heatmap = dateRange.map(date => {
      const log = logMap.get(date)
      return {
        date,
        level: log?.isActive
          ? log.hasQuiz && log.hasHomework
            ? 3
            : log.hasQuiz || log.hasHomework
            ? 2
            : 1
          : 0,
      }
    })

    // Nano streaks ab schema se directly read ho rahe hain — recalculate nahi
    const nanoStreaks = streak.nanoStreaks || []
    const findNano = (type: string) =>
      nanoStreaks.find((n: any) => n.type === type && n.active)?.count || 0

    const nextMilestone =
      MILESTONES.find(m => !(streak.milestonesReached || []).includes(m)) ||
      MILESTONES[MILESTONES.length - 1]

    return NextResponse.json({
      data: {
        currentStreak,
        longestStreak: streak.longestStreak || currentStreak,
        milestonesReached: streak.milestonesReached || [],
        milestoneHistory: streak.milestoneHistory || [],
        nextMilestone,
        todayActive: todayLog?.isActive || false,
        heatmap,
        nanoQuizStreak: findNano('quiz_streak'),
        nanoHomeworkStreak: findNano('no_homework_miss'),
        nanoNotesStreak: findNano('notes_read'),
        totalActiveDays: logs.filter(l => l.isActive).length,
      },
    })
  } catch (error) {
    console.error('Streak fetch error:', error)
    return NextResponse.json({ error: 'Streak data load nahi hua' }, { status: 500 })
  }
}

// ------ POST: Activity log + streak update (atomic, race-condition-safe) ------

export async function POST(req: NextRequest) {
  try {
    const token = (await getToken({ req, secret: process.env.NEXTAUTH_SECRET })) as any
    if (!token || token.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json().catch(() => ({}))

    // Strict validation — sirf boolean accept karo, koi truthy string nahi
    const hasQuiz = body.hasQuiz === true
    const hasHomework = body.hasHomework === true
    const hasNotes = body.hasNotes === true

    if (!hasQuiz && !hasHomework && !hasNotes) {
      return NextResponse.json(
        { error: 'Kam az kam ek activity (quiz/homework/notes) true honi chahiye' },
        { status: 400 }
      )
    }

    const today = getTodayStr()

    // Step 1: Atomic upsert — agar aaj ka log nahi hai toh push karo, hai toh kuch na karo
    // (race condition se bachne ke liye yeh do-step approach: pehle ensure karo entry exist kare)
    await Streak.updateOne(
      { studentId: token.id, 'logs.date': { $ne: today } },
      {
        $setOnInsert: { studentId: token.id },
        $push: {
          logs: {
            $each: [{ date: today, isActive: true, hasQuiz, hasHomework, hasNotes }],
            $slice: -LOG_WINDOW_DAYS, // hamesha sirf last 90 entries rakho
          },
        },
      },
      { upsert: true }
    )

    // Step 2: Agar aaj ka log already tha, toh flags ko atomically update karo
    const updateFields: any = { 'logs.$.isActive': true }
    if (hasQuiz) updateFields['logs.$.hasQuiz'] = true
    if (hasHomework) updateFields['logs.$.hasHomework'] = true
    if (hasNotes) updateFields['logs.$.hasNotes'] = true

    await Streak.updateOne(
      { studentId: token.id, 'logs.date': today },
      { $set: updateFields }
    )

    // Step 3: Fresh document fetch karo updated logs ke saath calculation ke liye
    const streak = await Streak.findOne({ studentId: token.id })
    if (!streak) {
      return NextResponse.json({ error: 'Streak record nahi mila' }, { status: 500 })
    }

    const sorted = [...streak.logs].sort((a: any, b: any) => b.date.localeCompare(a.date))
    let count = 0
    for (const log of sorted) {
      if (log.isActive) count++
      else break
    }

    streak.currentStreak = count
    if (count > streak.longestStreak) streak.longestStreak = count
    streak.lastActiveDate = today

    // Milestones — ab timestamp ke saath
    for (const m of MILESTONES) {
      if (count >= m && !streak.milestonesReached.includes(m)) {
        streak.milestonesReached.push(m)
        streak.milestoneHistory.push({ day: m, achievedAt: new Date() })
      }
    }

    // Nano streaks — actually update karo, GET mein recalculate nahi
    updateNanoStreak(streak, 'quiz_streak', hasQuiz)
    updateNanoStreak(streak, 'no_homework_miss', hasHomework)
    updateNanoStreak(streak, 'notes_read', hasNotes)

    await streak.save()

    return NextResponse.json({
      data: {
        currentStreak: count,
        longestStreak: streak.longestStreak,
        newMilestones: streak.milestoneHistory
          .filter((m: any) => m.day && count === m.day)
          .map((m: any) => m.day),
      },
    })
  } catch (error) {
    console.error('Streak update error:', error)
    return NextResponse.json({ error: 'Streak update nahi hua' }, { status: 500 })
  }
}

// Nano streak helper — agar activity hui toh count++, nahi hui toh reset
function updateNanoStreak(streak: any, type: string, didActivity: boolean) {
  let nano = streak.nanoStreaks.find((n: any) => n.type === type)
  if (!nano) {
    nano = { type, count: 0, active: true, startedAt: new Date() }
    streak.nanoStreaks.push(nano)
  }
  if (didActivity) {
    nano.count += 1
    nano.active = true
  } else {
    nano.count = 0
    nano.active = false
    nano.startedAt = new Date()
  }
}