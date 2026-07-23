// src/app/api/generator/route.ts
// ZeeShaoor.pk — Paper Generator API (SQ Engine v2 + Dual-Template Board System)

import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Question from '@/models/Question'
import { generateSQPaper, type SqGenerationConfig, type SqQuestion } from '@/lib/sq-engine'
import { generateLQPaper, type LqGenerationConfig, type LqQuestion } from '@/lib/lq-engine'

const BOARD_WEIGHTAGE: Record<string, { mcq: number; short: number; long: number }> = {
  default:   { mcq: 15, short: 16, long: 24 },
  physics:   { mcq: 15, short: 16, long: 24 },
  chemistry: { mcq: 15, short: 16, long: 24 },
  biology:   { mcq: 15, short: 16, long: 24 },
  math:      { mcq: 15, short: 30, long: 30 },
  english:   { mcq: 10, short: 20, long: 20 },
  urdu:      { mcq: 10, short: 20, long: 20 },
}

const CHAPTER_MAP: Record<string, Record<string, string>> = {
  physics: {
    '1': 'Physical Quantities and Measurements',
    '2': 'Kinematics', '3': 'Dynamics', '4': 'Turning Effect of Forces',
    '5': 'Gravitation', '6': 'Work and Energy', '7': 'Properties of Matter',
    '8': 'Thermal Properties of Matter', '9': 'Transfer of Heat',
  },
  chemistry: {
    '1': 'Fundamentals of Chemistry', '2': 'Structure of Atoms',
    '3': 'Periodic Table and Periodicity of Properties', '4': 'Structure of Molecules',
    '5': 'Physical States of Matter', '6': 'Solutions',
    '7': 'Electrochemistry', '8': 'Chemical Reactivity',
  },
  biology: {
    '1': 'Introduction to Biology', '2': 'Solving a Biological Problem',
    '3': 'Biodiversity', '4': 'Cells and Tissues', '5': 'Cell Cycle',
    '6': 'Enzymes', '7': 'Bioenergetics', '8': 'Nutrition', '9': 'Transport',
  },
  default: {
    '1': 'Chapter 1', '2': 'Chapter 2', '3': 'Chapter 3',
    '4': 'Chapter 4', '5': 'Chapter 5', '6': 'Chapter 6',
    '7': 'Chapter 7', '8': 'Chapter 8', '9': 'Chapter 9',
    '10': 'Chapter 10', '11': 'Chapter 11', '12': 'Chapter 12',
  }
}

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
  const parts = label.replace('BISE ', '').trim()
  return parts
}

async function fetchQ(base: Record<string, any>, type: 'MCQ' | 'Short' | 'Long', count: number, difficulty?: string) {
  if (count <= 0) return []
  const match: Record<string, any> = { ...base, questionType: type }
  if (difficulty && difficulty !== 'Mixed') match.difficulty = difficulty
  return Question.aggregate([{ $match: match }, { $sample: { size: count * 2 } }])
}

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

  // Tier 1: boardTags match
  if (boardName) {
    const tier1 = await fetchQ({ ...baseQuery, boardTags: boardName }, type, count, difficulty)
    results = tier1.filter((q: any) => q.boardTags?.includes(boardName))
  }

  // Tier 2: region fallback
  if (results.length < count) {
    const region = boardName === 'Federal' || boardLabel?.includes('FBISE') ? 'Federal' : 'Punjab'
    const needed = count - results.length
    const tier2 = await fetchQ({ ...baseQuery, region, _id: { $nin: results.map((r: any) => r._id) } }, type, needed, difficulty)
    results = [...results, ...tier2]
  }

  // Tier 3: no filter
  if (results.length < count) {
    const needed = count - results.length
    const tier3 = await fetchQ({ ...baseQuery, _id: { $nin: results.map((r: any) => r._id) } }, type, needed, difficulty)
    results = [...results, ...tier3]
  }

  return results.slice(0, count)
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
      boardConfig,
    } = body

    const resolvedClass = academicClass || cls
    const resolvedSubject = body.subject

    if (!resolvedClass || !resolvedSubject) {
      return NextResponse.json({ success: false, message: 'Class aur Subject zaruri hain.' }, { status: 400 })
    }

    const cleanClass = String(resolvedClass).replace(/^(Class\s*)/i, '').replace(/th|st|nd|rd/gi, '').trim()
    const subjectKey = resolvedSubject.toLowerCase().includes('physics')   ? 'physics'
                     : resolvedSubject.toLowerCase().includes('chemistry') ? 'chemistry'
                     : resolvedSubject.toLowerCase().includes('biology')   ? 'biology'
                     : 'default'

    const baseQuery: Record<string, any> = { classLevel: cleanClass, subject: resolvedSubject }

    if (chapter && chapter !== 'mixed' && chapter !== 'mix') {
      const chMap = CHAPTER_MAP[subjectKey] || CHAPTER_MAP.default
      const cleanChapter = String(chapter).replace(/^ch\s*/i, '').trim()
      baseQuery.chapter = chMap[cleanChapter] || cleanChapter
    }

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
      mCount = Number(mcqCount) || 0
      sCount = Number(shortCount) || 0
      lCount = Number(longCount) || 0

      // Board mode via boardConfig
      if (boardConfig) {
        isBoardMode = true
        boardLabel = boardConfig.boardLabel
        mCount = boardConfig.mcq || mCount
        sCount = boardConfig.sqTotalGiven || sCount
        lCount = boardConfig.lqAttempt || lCount
      }

      if (sqConfig?.sections) {
        sCount = sqConfig.sections.reduce((sum: number, s: any) => sum + (s.given || 0), 0)
      } else if (sqCount) {
        sCount = Number(sqCount)
      }
    }

    // Use fallback-aware fetching in board mode
    const rawMcqs = isBoardMode
      ? await fetchWithFallback(baseQuery, 'MCQ', mCount, boardLabel, diff)
      : await fetchQ(baseQuery, 'MCQ', mCount, diff)
    const rawShort = isBoardMode
      ? await fetchWithFallback(baseQuery, 'Short', sCount, boardLabel, diff)
      : await fetchQ(baseQuery, 'Short', sCount, diff)
    const rawLong = isBoardMode
      ? await fetchWithFallback(baseQuery, 'Long', lCount, boardLabel, diff)
      : await fetchQ(baseQuery, 'Long', lCount, diff)

    if (rawMcqs.length + rawShort.length + rawLong.length === 0) {
      const name = testModel ? MODEL_NAMES[String(testModel)] : 'Generator'
      return NextResponse.json({
        success: false,
        message: `${name} — Koi questions nahi mile. Pehle CSV import karo.`
      }, { status: 404 })
    }

    // Dual-template board section building
    let boardSections = null
    if (isBoardMode && boardConfig) {
      const template = boardConfig.template === 'federal' ? BOARD_TEMPLATES.federal : BOARD_TEMPLATES.punjab

      // Build SQ sections
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
        // MCQs are Q.1, so SQ sections start at Q.2 (BISE numbering)
        sections: template.sqSections.map((s, i) => ({ label: `Q.${i + 2}`, given: s.given, attempt: s.attempt })),
        balance: { difficulty: { easy: 0.3, medium: 0.4, hard: 0.3 }, slo: { knowledge: 0.35, comprehension: 0.4, application: 0.25 }, subType: { theory: 0.7, numerical: 0.3 } },
      }
      const sqResult = sqPool.length > 0 ? generateSQPaper(sqGenConfig, sqPool) : null

      // Build LQ composites
      let lqResult = null
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
        lqResult = generateLQPaper(lqGenConfig, theoryPool.map(mapQ), numericalPool.map(mapQ))
      }

      boardSections = {
        template: boardConfig.template,
        sections: boardConfig.template === 'federal'
          ? { A: { type: 'MCQ', compulsory: true, count: mCount }, B: { type: 'Short', compulsory: false, given: template.sqSections[0].given, attempt: template.sqSections[0].attempt }, C: { type: 'Long', compulsory: false, given: template.lqGiven, attempt: template.lqAttempt } }
          : null,
        sqResult,
        lqResult,
      }
    }

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

    let lqResult = null
    if (lqConfig && !isBoardMode) {
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

    return NextResponse.json({
      success: true,
      modelName: testModel ? MODEL_NAMES[String(testModel)] : 'Custom',
      data: {
        mcqs: rawMcqs.slice(0, mCount),
        shortQuestions: sqResult ? sqResult.sections.flatMap(s => s.questions) : rawShort.slice(0, sCount),
        longQuestions: lqResult ? lqResult.sections.flatMap(s => s.solos) : rawLong.slice(0, lCount),
        sqSections: sqResult?.sections || (isBoardMode ? boardSections?.sqResult?.sections : null),
        sqStats: sqResult?.stats || (isBoardMode ? boardSections?.sqResult?.stats : null),
        lqSections: lqResult?.sections || (isBoardMode ? boardSections?.lqResult?.sections : null),
        lqStats: lqResult?.stats || (isBoardMode ? boardSections?.lqResult?.stats : null),
        boardSections,
      },
      total,
    }, { status: 200 })

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
