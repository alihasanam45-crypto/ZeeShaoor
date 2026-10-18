// src/app/api/generator/route.ts
// ZeeShaoor.pk — Paper Generator API (SQ Engine v2 + Dual-Template Board System)
//
// SIMPLE EXPLANATION:
// Teacher ek "model" (jaisay Model 8) select karta hai → hum uske MCQ/Short/
// Long counts nikalte hain → database se random questions uthate hain → agar
// koi structured section chahiye (board pattern) to SQ/LQ engines use karke
// unhein sections mein arrange karte hain → aakhir mein sab combine karke
// wapas bhej dete hain.

import { NextResponse } from 'next/server'
import { normalizeChapter } from '@/data/chapter-registry'
import { connectDB } from '@/lib/mongodb'
import Question from '@/models/Question'
import { generateSQPaper, type SqGenerationConfig, type SqQuestion } from '@/lib/sq-engine'
import { generateLQPaper, type LqGenerationConfig, type LqQuestion, type LqSectionResult } from '@/lib/lq-engine'

// ── Board-level subject weightage (jab model 19 = "Standardized Board Matrix" select ho) ──
const BOARD_WEIGHTAGE: Record<string, { mcq: number; short: number; long: number }> = {
  default:   { mcq: 15, short: 16, long: 24 },
  physics:   { mcq: 15, short: 16, long: 24 },
  chemistry: { mcq: 15, short: 16, long: 24 },
  biology:   { mcq: 15, short: 16, long: 24 },
  math:      { mcq: 15, short: 30, long: 30 },
  english:   { mcq: 10, short: 20, long: 20 },
  urdu:      { mcq: 10, short: 20, long: 20 },
}

// Chapters are matched by NUMBER, never by prose name. The map that used to
// live here disagreed with both the textbook and the CSVs from chapter 5 on
// (it called Class 9 Physics ch5 "Gravitation"; the book calls it "Work,
// Energy and Power"), so every chapter-filtered query matched zero documents.
// See src/data/chapter-registry.ts.

// ── Har model ke MCQ / Short / Long counts (aapke 20 models yahan defined hain) ──
const TEST_MODELS: Record<string, { mcq: number; short: number; long: number; difficulty?: string; boardPattern?: boolean; custom?: boolean }> = {
  '1':  { mcq: 10, short: 0,  long: 0  },
  '2':  { mcq: 20, short: 0,  long: 0  },
  '3':  { mcq: 50, short: 0,  long: 0  },
  '4':  { mcq: 0,  short: 10, long: 0  },
  '5':  { mcq: 0,  short: 0,  long: 5  },
  '6':  { mcq: 15, short: 8,  long: 0  },
  '7':  { mcq: 0,  short: 8,  long: 4  },
  '8':  { mcq: 15, short: 8,  long: 4  },
  '9':  { mcq: 10, short: 8,  long: 0  },
  '10': { mcq: 0,  short: 10, long: 0  },
  '11': { mcq: 0,  short: 0,  long: 5  },
  '12': { mcq: 15, short: 10, long: 5  },
  '13': { mcq: 10, short: 5,  long: 3,  difficulty: 'Hard'   },
  '14': { mcq: 5,  short: 5,  long: 0,  difficulty: 'Easy'   },
  '15': { mcq: 10, short: 8,  long: 3,  difficulty: 'Medium' },
  '16': { mcq: 10, short: 5,  long: 5,  difficulty: 'Hard'   },
  '17': { mcq: 10, short: 8,  long: 3  },
  '18': { mcq: 15, short: 12, long: 5  },
  '19': { mcq: 0,  short: 0,  long: 0,  boardPattern: true   },
  '20': { mcq: 0,  short: 0,  long: 0,  custom: true         },
}

const MODEL_NAMES: Record<string, string> = {
  '1': 'Rapid Precision Drill',          '2': 'Core Objective Matrix',
  '3': 'Quantum Assessment Protocol',    '4': 'Conceptual Briefs',
  '5': 'In-Depth Analytical Suite',      '6': 'Hybrid Conceptual Evaluation',
  '7': 'Advanced Analytical Framework',  '8': 'Omni-Assess Foundation',
  '9': 'Pure Theory Evaluation',         '10': 'Rigid Concept Drill',
  '11': 'Strict Analytical Mode',        '12': 'Absolute Mandatory Module',
  '13': 'Quantitative Logic Check',      '14': 'Rapid Diagnostic Assessment',
  '15': 'Core Competency Check',         '16': 'Advanced Cognitive Evaluation',
  '17': 'Standard Evaluation Outline',   '18': 'Comprehensive Mastery Blueprint',
  '19': 'Standardized Board Matrix',     '20': 'The Architect: Elite Custom Builder',
}

const BOARD_TEMPLATES = {
  punjab: {
    sqSections: [{ given: 8, attempt: 5 }, { given: 8, attempt: 5 }, { given: 8, attempt: 5 }],
    sqMarksPerQ: 2, lqGiven: 3, lqAttempt: 2, lqMarksPerQ: 9,
  },
  federal: {
    sqSections: [{ given: 15, attempt: 11 }],
    sqMarksPerQ: 3, lqGiven: 3, lqAttempt: 2, lqMarksPerQ: 10,
  },
} as const

function extractBoardName(label: string): string {
  return label.replace('BISE ', '').trim()
}

/** Database se ek type (MCQ/Short/Long) ke random questions uthata hai. */
async function fetchQ(base: Record<string, any>, type: 'MCQ' | 'Short' | 'Long', count: number, difficulty?: string) {
  if (count <= 0) return []
  const match: Record<string, any> = { ...base, questionType: type }
  if (difficulty && difficulty !== 'Mixed') match.difficulty = difficulty
  return Question.aggregate([{ $match: match }, { $sample: { size: count * 2 } }])
}

/**
 * Board mode ke liye 3-tier fallback: pehle exact board tag dhoondo, na mile
 * to region (Punjab/Federal) se, wo bhi na mile to bina kisi filter ke —
 * taake board paper kabhi khali na jaye.
 */
async function fetchWithFallback(
  baseQuery: Record<string, any>,
  type: 'MCQ' | 'Short' | 'Long',
  count: number,
  boardLabel?: string,
  difficulty?: string,
) {
  if (count <= 0) return []
  const boardName = boardLabel ? extractBoardName(boardLabel) : undefined

  let results: any[] = []

  // Tier 1: exact board tag match
  if (boardName) {
    const tier1 = await fetchQ({ ...baseQuery, boardTags: boardName }, type, count, difficulty)
    results = tier1.filter((q: any) => q.boardTags?.includes(boardName))
  }

  // Tier 2: region fallback (Punjab/Federal)
  if (results.length < count) {
    const region = boardName === 'Federal' || boardLabel?.includes('FBISE') ? 'Federal' : 'Punjab'
    const needed = count - results.length
    const tier2 = await fetchQ({ ...baseQuery, region, _id: { $nin: results.map((r: any) => r._id) } }, type, needed, difficulty)
    results = [...results, ...tier2]
  }

  // Tier 3: no filter — jo bhi mile
  if (results.length < count) {
    const needed = count - results.length
    const tier3 = await fetchQ({ ...baseQuery, _id: { $nin: results.map((r: any) => r._id) } }, type, needed, difficulty)
    results = [...results, ...tier3]
  }

  return results.slice(0, count)
}

/** LQ result se questions nikalta hai — pairing ho to dono sides (a+b), warna solos. */
function flattenLqQuestions(sections: LqSectionResult[]): LqQuestion[] {
  return sections.flatMap(s =>
    s.enforcePairing ? s.pairings.flatMap(p => [p.a, p.b]) : s.solos
  )
}

export async function POST(req: Request) {
  try {
    await connectDB()

    let body: any
    try { body = await req.json() }
    catch { return NextResponse.json({ success: false, message: 'Invalid JSON.' }, { status: 400 }) }

    const {
      academicClass, subject, chapter, testModel, custom,
      mcqCount, shortCount, longCount,
      class: cls, sqConfig, sqCount, lqCount, lqConfig,
      boardConfig, phase,
    } = body

    const resolvedClass = academicClass || cls

    // ── Basic validation ──
    if (!resolvedClass || !subject) {
      return NextResponse.json({
        success: false,
        error: 'Class and Subject are required.',
        message: 'Class aur Subject zaruri hain.',
      }, { status: 400 })
    }

    // Chapter select na ho to client-side mistake hai, server error nahi.
    // "mixed" (sab chapters mix) khud accept hoti hai.
    const hasChapterList = Array.isArray(body.chapters) && body.chapters.length > 0
    const hasSingleChapter = typeof chapter === 'string' && chapter.trim() !== ''
    if (!hasChapterList && !hasSingleChapter) {
      return NextResponse.json({
        success: false,
        error: 'No chapters selected. Please select at least one chapter.',
        message: 'No chapters selected. Please select at least one chapter.',
      }, { status: 400 })
    }

    const cleanClass = String(resolvedClass).replace(/^(Class\s*)/i, '').replace(/th|st|nd|rd/gi, '').trim()
    const subjectKey = subject.toLowerCase().includes('physics')   ? 'physics'
                     : subject.toLowerCase().includes('chemistry') ? 'chemistry'
                     : subject.toLowerCase().includes('biology')   ? 'biology'
                     : 'default'

    const baseQuery: Record<string, any> = { classLevel: cleanClass, subject }

    // "ch4", "Ch 4", "4" — sab accept; null = "mixed" (chapter filter na lagao)
    const chapterNo = normalizeChapter(chapter)
    if (chapterNo) baseQuery.chapter = chapterNo

    // Multi-chapter selection support
    const chapterList: string[] = Array.isArray(body.chapters)
      ? body.chapters.map(normalizeChapter).filter((c: string | null): c is string => Boolean(c))
      : []
    if (chapterList.length > 1) baseQuery.chapter = { $in: chapterList }
    else if (chapterList.length === 1) baseQuery.chapter = chapterList[0]

    // ── Kitne MCQ / Short / Long chahiye — model se ya manual counts se ──
    let mCount = 0, sCount = 0, lCount = 0
    let diff: string | undefined
    let isBoardMode = false
    let boardLabel: string | undefined

    if (testModel) {
      const model = TEST_MODELS[String(testModel)]
      if (!model) return NextResponse.json({ success: false, message: 'Invalid test model.' }, { status: 400 })

      mCount = model.mcq; sCount = model.short; lCount = model.long
      diff = model.difficulty

      if (model.boardPattern) {
        const w = BOARD_WEIGHTAGE[subjectKey] || BOARD_WEIGHTAGE.default
        mCount = w.mcq; sCount = w.short; lCount = w.long
      }

      if (model.custom) {
        if (!custom) return NextResponse.json({ success: false, message: 'Custom config missing.' }, { status: 400 })
        mCount = Number(custom.mcqCount) || 0
        sCount = Number(custom.shortCount) || 0
        lCount = Number(custom.longCount) || 0
      }
    } else {
      // UI kabhi { mcqCount, sqCount, lqCount } bhejta hai, kabhi
      // { mcqCount, shortCount, longCount } — dono spellings accept karo.
      mCount = Number(mcqCount) || 0
      sCount = Number(shortCount ?? sqCount) || 0
      lCount = Number(longCount ?? lqCount) || 0

      if (boardConfig) {
        isBoardMode = true
        boardLabel = boardConfig.boardLabel
        mCount = boardConfig.mcq || mCount
        sCount = boardConfig.sqTotalGiven || sCount
        lCount = boardConfig.lqAttempt || lCount
      }

      const sqPhases = ['sq', 'hybrid', 'board']
      if (sqPhases.includes(phase) && sqConfig?.sections?.length) {
        sCount = sqConfig.sections.reduce((sum: number, s: any) => sum + (s.given || 0), 0)
      }
    }

    // 0+0+0 request → khali paper hi banega, isliye foran mana kar do
    if (mCount + sCount + lCount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'No questions requested — set a count for MCQ, Short or Long questions.',
        message: 'No questions requested — set a count for MCQ, Short or Long questions.',
      }, { status: 400 })
    }

    // ── Database se teeno types fetch karo ──
    const rawMcqs = isBoardMode
      ? await fetchWithFallback(baseQuery, 'MCQ', mCount, boardLabel, diff)
      : await fetchQ(baseQuery, 'MCQ', mCount, diff)
    const rawShort = isBoardMode
      ? await fetchWithFallback(baseQuery, 'Short', sCount, boardLabel, diff)
      : await fetchQ(baseQuery, 'Short', sCount, diff)
    const rawLong = isBoardMode
      ? await fetchWithFallback(baseQuery, 'Long', lCount, boardLabel, diff)
      : await fetchQ(baseQuery, 'Long', lCount, diff)

    console.log(`GEN: query=${JSON.stringify(baseQuery)} want{mcq:${mCount},short:${sCount},long:${lCount}} diff=${diff ?? 'any'} board=${isBoardMode}`)
    console.log(`GEN: got{mcq:${rawMcqs.length},short:${rawShort.length},long:${rawLong.length}}`)

    // ⚠️ PARTIAL SHORTFALL WARNING — ye aapka masla pakadne ke liye hai.
    // Agar koi type maangi gayi thi (count > 0) lekin database se 0 mili,
    // to yahan foran warning print hogi — matlab us type ki koi CSV us
    // chapter ke liye seed hi nahi hui.
    const shortfalls: string[] = []
    if (mCount > 0 && rawMcqs.length === 0)  shortfalls.push(`MCQ: mangi ${mCount}, mili 0`)
    if (sCount > 0 && rawShort.length === 0) shortfalls.push(`Short: mangi ${sCount}, mili 0`)
    if (lCount > 0 && rawLong.length === 0)  shortfalls.push(`Long: mangi ${lCount}, mili 0`)
    if (shortfalls.length > 0) {
      console.warn(`⚠️ GEN WARNING (chapter=${baseQuery.chapter ?? 'mixed'}): ${shortfalls.join(' | ')}`)
    }

    // ── Agar teeno types mein se kuch bhi na mile, poori tarah fail ho jao ──
    if (rawMcqs.length + rawShort.length + rawLong.length === 0) {
      const name = testModel ? MODEL_NAMES[String(testModel)] : 'Generator'

      // Har filter ek-ek karke check karo taake asal wajah pata chale
      // (empty DB? galat class? galat subject? galat chapter? galat difficulty?)
      const classFilter = { classLevel: cleanClass } as Record<string, unknown>
      const inSubject = await Question.countDocuments({ ...classFilter, subject })
      const inClass = await Question.countDocuments(classFilter)
      const grandTotal = await Question.estimatedDocumentCount()

      let reason: string
      if (grandTotal === 0) {
        reason = 'Question bank is empty — run the CSV import (GET /api/admin/seed-questions as admin).'
      } else if (inClass === 0) {
        reason = `No questions exist for Class ${cleanClass}.`
      } else if (inSubject === 0) {
        const subjects = await Question.distinct('subject', classFilter)
        reason = `No questions for "${subject}" in Class ${cleanClass}. Available: ${subjects.join(', ') || 'none'}.`
      } else if (baseQuery.chapter) {
        const chapters = await Question.distinct('chapter', { ...classFilter, subject } as Record<string, unknown>)
        reason = `Class ${cleanClass} ${subject} has ${inSubject} questions, but none in the selected chapter. Chapters available: ${chapters.sort((a, b) => Number(a) - Number(b)).join(', ')}.`
      } else if (diff) {
        reason = `Class ${cleanClass} ${subject} has ${inSubject} questions, but none at "${diff}" difficulty.`
      } else {
        reason = `Class ${cleanClass} ${subject} has ${inSubject} questions, but none of the requested types.`
      }

      console.warn(`GEN: 0 results — ${reason}`)
      return NextResponse.json({
        success: false,
        error: 'No questions found for the selected criteria.',
        message: `${name} — ${reason}`,
        diagnostics: { query: baseQuery, requested: { mcq: mCount, short: sCount, long: lCount }, inSubject, inClass, grandTotal },
      }, { status: 400 })
    }

    // ── Board mode: SQ/LQ ko proper sections (Q.2, Q.3...) mein arrange karo ──
    let boardSections = null
    if (isBoardMode && boardConfig) {
      const template = boardConfig.template === 'federal' ? BOARD_TEMPLATES.federal : BOARD_TEMPLATES.punjab

      const sqPool: SqQuestion[] = rawShort.map((q: any) => ({
        _id: q._id,
        questionText: q.questionText,
        correctAnswer: q.correctAnswer,
        chapter: q.chapter,
        topicId: q.topicId,
        difficulty: q.difficulty || 'Medium',
        sloTag: q.sloTag || 'Comprehension',
        subType: q.subType || 'Theory',
        marks: 2,
      }))
      const sqGenConfig: SqGenerationConfig = {
        mode: 'bise_pattern',
        // MCQs Q.1 hain, isliye SQ sections Q.2 se shuru (BISE numbering)
        sections: template.sqSections.map((s, i) => ({ label: `Q.${i + 2}`, given: s.given, attempt: s.attempt })),
        balance: { difficulty: { easy: 0.3, medium: 0.4, hard: 0.3 }, slo: { knowledge: 0.35, comprehension: 0.4, application: 0.25 }, subType: { theory: 0.7, numerical: 0.3 } },
      }
      const boardSqResult = sqPool.length > 0 ? generateSQPaper(sqGenConfig, sqPool) : null

      let boardLqResult = null
      if (template.lqGiven > 0 && lCount > 0) {
        const theoryPool = await Question.aggregate([{ $match: { ...baseQuery, questionType: 'Long', questionCategory: 'Long_Theory' } }, { $sample: { size: 20 } }])
        const numericalPool = await Question.aggregate([{ $match: { ...baseQuery, questionType: 'Long', questionCategory: 'Long_Numerical' } }, { $sample: { size: 20 } }])
        const mapQ = (q: any): LqQuestion => ({
          _id: q._id, questionText: q.questionText, correctAnswer: q.correctAnswer,
          chapter: q.chapter, topicId: q.topicId, difficulty: q.difficulty || 'Medium',
          sloTag: q.sloTag || 'Comprehension', questionCategory: q.questionCategory || 'Long_Theory',
          marks: q.questionCategory === 'Long_Numerical' ? 5 : 4,
        })
        const lqGenConfig: LqGenerationConfig = {
          mode: 'bise_pattern', given: template.lqGiven, attempt: template.lqAttempt,
          enforcePairing: true, sections: [],
          balance: { difficulty: { easy: 0.25, medium: 0.4, hard: 0.35 }, slo: { knowledge: 0.3, comprehension: 0.4, application: 0.3 } },
        }
        boardLqResult = generateLQPaper(lqGenConfig, theoryPool.map(mapQ), numericalPool.map(mapQ))

        if (boardLqResult.totalQuestions === 0 && lCount > 0) {
          console.warn(`⚠️ GEN WARNING: Board LQ pairing failed — Theory pool=${theoryPool.length}, Numerical pool=${numericalPool.length}. Dono chahiye pairing ke liye.`)
        }
      }

      boardSections = {
        template: boardConfig.template,
        sections: boardConfig.template === 'federal'
          ? { A: { type: 'MCQ', compulsory: true, count: mCount }, B: { type: 'Short', compulsory: false, given: template.sqSections[0].given, attempt: template.sqSections[0].attempt }, C: { type: 'Long', compulsory: false, given: template.lqGiven, attempt: template.lqAttempt } }
          : null,
        sqResult: boardSqResult,
        lqResult: boardLqResult,
      }
    }

    // ── Non-board mode: custom SQ sections agar diye gaye hon ──
    let sqResult = null
    if (sqConfig?.sections && sqConfig.sections.length > 0 && rawShort.length > 0 && !isBoardMode) {
      const pool: SqQuestion[] = rawShort.map((q: any) => ({
        _id: q._id,
        questionText: q.questionText,
        correctAnswer: q.correctAnswer,
        chapter: q.chapter,
        topicId: q.topicId,
        difficulty: q.difficulty || 'Medium',
        sloTag: q.sloTag || 'Comprehension',
        subType: q.subType || 'Theory',
        marks: 2,
      }))

      const genConfig: SqGenerationConfig = {
        mode: sqConfig.mode || 'flexible_choice',
        sections: sqConfig.sections,
        balance: sqConfig.balance || { difficulty: { easy: 0.3, medium: 0.4, hard: 0.3 }, slo: { knowledge: 0.35, comprehension: 0.4, application: 0.25 }, subType: { theory: 0.7, numerical: 0.3 } },
      }

      sqResult = generateSQPaper(genConfig, pool)
    }

    // ── Non-board mode: custom LQ config agar diya gaya ho ──
    const lqPhases = ['lq', 'hybrid']
    let lqResult = null
    if (lqPhases.includes(phase) && lqConfig && !isBoardMode) {
      const theoryQuery = { ...baseQuery, questionType: 'Long', questionCategory: 'Long_Theory' }
      const numericalQuery = { ...baseQuery, questionType: 'Long', questionCategory: 'Long_Numerical' }
      const theoryPool = await Question.aggregate([{ $match: theoryQuery }, { $sample: { size: 20 } }])
      const numericalPool = await Question.aggregate([{ $match: numericalQuery }, { $sample: { size: 20 } }])

      if (lqConfig.given > 0 && (theoryPool.length > 0 || numericalPool.length > 0)) {
        const mapQ = (q: any): LqQuestion => ({
          _id: q._id,
          questionText: q.questionText,
          correctAnswer: q.correctAnswer,
          chapter: q.chapter,
          topicId: q.topicId,
          difficulty: q.difficulty || 'Medium',
          sloTag: q.sloTag || 'Comprehension',
          questionCategory: q.questionCategory || 'Long_Theory',
          marks: q.questionCategory === 'Long_Numerical' ? 5 : 4,
        })

        const genConfig: LqGenerationConfig = {
          mode: lqConfig.mode || 'bise_pattern',
          given: lqConfig.given || 3,
          attempt: lqConfig.attempt || 2,
          enforcePairing: lqConfig.enforcePairing ?? true,
          sections: lqConfig.sections || [],
          balance: { difficulty: { easy: 0.25, medium: 0.4, hard: 0.35 }, slo: { knowledge: 0.3, comprehension: 0.4, application: 0.3 } },
        }

        lqResult = generateLQPaper(genConfig, theoryPool.map(mapQ), numericalPool.map(mapQ))
      }
    }

    const total = rawMcqs.length + rawShort.length + rawLong.length + (lqResult ? lqResult.totalQuestions : 0)

    // ── Final response ──
    return NextResponse.json({
      success: true,
      modelName: testModel ? MODEL_NAMES[String(testModel)] : 'Custom',
      data: {
        mcqs: rawMcqs.slice(0, mCount),
        shortQuestions: sqResult ? sqResult.sections.flatMap(s => s.questions) : rawShort.slice(0, sCount),
        longQuestions: lqResult ? flattenLqQuestions(lqResult.sections) : rawLong.slice(0, lCount),
        sqSections: sqResult?.sections || (isBoardMode ? boardSections?.sqResult?.sections : null),
        sqStats: sqResult?.stats || (isBoardMode ? boardSections?.sqResult?.stats : null),
        lqSections: lqResult?.sections || (isBoardMode ? boardSections?.lqResult?.sections : null),
        lqStats: lqResult?.stats || (isBoardMode ? boardSections?.lqResult?.stats : null),
        boardSections,
      },
      total,
    }, { status: 200 })

  } catch (err: any) {
    console.error('GEN: unhandled error', err)
    return NextResponse.json({
      success: false,
      error: err?.message || 'Paper generation failed.',
      message: err?.message || 'Paper generation failed.',
    }, { status: 500 })
  }
}