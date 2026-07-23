import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { connectDB } from '@/lib/mongodb'
import Question from '@/models/Question'
import type { IQuestion } from '@/models/Question'

const DATA_ROOT = path.join(process.cwd(), 'data')

const BLOOM_SLO_MAP: Record<string, 'Knowledge' | 'Comprehension' | 'Application'> = {
  Remember: 'Knowledge',
  Understand: 'Comprehension',
  Apply: 'Application',
  Analyze: 'Application',
  Evaluate: 'Application',
  Create: 'Application',
}

const NUMERICAL_STYLES = new Set([
  'calculate', 'calculation', 'numerical', 'solve', 'find', 'determine', 'state',
])

type ClassLevel = '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'

interface FileEntry {
  filePath: string
  classLevel: ClassLevel
  subject: string
}

/** Parse class+subject from a folder name like "9th_Physics" or "10th_computer". */
function parseClassSubjectFromFolder(folderName: string): { classLevel: ClassLevel; subject: string } | null {
  const m = folderName.match(/^(\d+)th_(.+)$/i)
  if (!m) return null
  let subject = m[2]
  subject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase()
  return { classLevel: m[1] as ClassLevel, subject }
}

/** Parse class+subject from a filename like "class_9_physics_ch1_mcqs.csv". */
function parseMetaFromFilename(filename: string): { classLevel: ClassLevel; subject: string } | null {
  const name = filename.replace(/\.csv$/i, '')
  const m = name.match(/^class_(\d+)_([a-z]+?)(?:_ch(?:apter)?_\d+|_\d+|$)/i)
  if (!m) return null
  let subject = m[2]
  subject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase()
  return { classLevel: m[1] as ClassLevel, subject }
}

/**
 * Recursively walk a directory and collect every CSV file together with its
 * resolved class-level and subject.  Metadata resolution order:
 *   1. Inherited from a parent folder matching "Nth_Subject"
 *   2. Parsed from the CSV filename itself ("class_N_subject_...")
 *   3. Skipped if neither source succeeds
 */
function collectFiles(dir: string, inheritedMeta: { classLevel: ClassLevel; subject: string } | null): FileEntry[] {
  const results: FileEntry[] = []
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch (err: any) {
    console.warn(`SEED:   Cannot read directory "${dir}" — ${err.message}`)
    return results
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    let stat: fs.Stats
    try {
      stat = fs.statSync(full)
    } catch {
      continue
    }

    if (stat.isDirectory()) {
      // Folder-level metadata overrides inherited value when it matches
      const folderMeta = parseClassSubjectFromFolder(entry.name) ?? inheritedMeta
      results.push(...collectFiles(full, folderMeta))
    } else if (stat.isFile() && entry.name.toLowerCase().endsWith('.csv')) {
      const meta = inheritedMeta ?? parseMetaFromFilename(entry.name)
      if (meta) {
        results.push({ filePath: full, ...meta })
      } else {
        console.warn(`SEED:   [SKIP] ${path.relative(DATA_ROOT, full)} — could not resolve class/subject`)
      }
    }
    // non-CSV files are silently ignored
  }

  return results
}

function detectQuestionType(filePath: string): 'MCQ' | 'Short' | 'Long' | null {
  const name = path.basename(filePath).toLowerCase()
  if (name.includes('mcq')) return 'MCQ'
  if (name.includes('long')) return 'Long'
  if (name.includes('short')) return 'Short'
  return null
}

function extractChapter(topic: string): string {
  const m = topic.match(/^(\d+)/)
  return m ? m[1] : topic
}

function parseNum(val: string | undefined): number | undefined {
  if (!val || val.trim() === '') return
  const n = Number(val)
  return isNaN(n) ? undefined : n
}

function isNumericalStyle(style: string | undefined): boolean {
  if (!style) return false
  const s = style.toLowerCase().trim()
  for (const kw of NUMERICAL_STYLES) {
    if (s.includes(kw)) return true
  }
  return false
}

function isSeparatorRow(row: Record<string, string>): boolean {
  if (!row.question || row.question.trim() === '') return true
  if (row.question_hash === 'TOPIC_SEP') return true
  if ((row.question_hash || '').startsWith('sep_')) return true
  if ((row.question_type || '').toLowerCase() === 'topic') return true
  if ((row.question_style || '').toLowerCase() === 'topic_separator') return true
  return false
}

function normalizeHeaders(parsed: Papa.ParseResult<Record<string, string>>): void {
  if (!parsed.meta.fields) return
  const lowerMap = new Map<string, string>()
  for (const f of parsed.meta.fields) {
    lowerMap.set(f.toLowerCase().trim(), f)
  }
  for (const row of parsed.data) {
    for (const [lower, orig] of lowerMap) {
      if (lower !== orig && row[orig] !== undefined) {
        row[lower] = row[orig]
      }
    }
  }
}

export async function GET() {
  const startTime = Date.now()
  console.log('=== SEED: Started ===')

  try {
    await connectDB()
    console.log('SEED: MongoDB connected')
  } catch (err: any) {
    console.error('SEED: MongoDB connection failed —', err.message)
    return NextResponse.json({ success: false, message: `DB connection failed: ${err.message}` }, { status: 500 })
  }

  // ---- Discover all CSV files with resolved metadata ----
  let allFiles: FileEntry[] = []
  try {
    allFiles = collectFiles(DATA_ROOT, null)
  } catch (err: any) {
    console.error('SEED: File discovery failed —', err.message)
    return NextResponse.json({ success: false, message: `File discovery failed: ${err.message}` }, { status: 500 })
  }

  console.log(`SEED: Discovered ${allFiles.length} CSV files across all folders`)

  if (allFiles.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No CSV files found in data/ directory.',
      stats: { parsed: 0, inserted: 0, skipped: 0 },
    })
  }

  // Group by subject for summary logging
  const bySubject = new Map<string, FileEntry[]>()
  for (const f of allFiles) {
    const key = `${f.classLevel}/${f.subject}`
    if (!bySubject.has(key)) bySubject.set(key, [])
    bySubject.get(key)!.push(f)
  }

  let totalParsed = 0
  let totalInserted = 0
  let totalSkipped = 0
  const errors: string[] = []

  for (const [subjectKey, files] of bySubject) {
    const [classLevel, subject] = subjectKey.split('/') as [ClassLevel, string]
    const subjectStart = Date.now()
    let subjectParsed = 0
    let subjectInserted = 0
    let subjectSkipped = 0

    console.log(`SEED: Processing ${subjectKey}/ — ${files.length} file(s)`)

    for (const fileEntry of files) {
      const { filePath: csvFile } = fileEntry
      const relativePath = path.relative(DATA_ROOT, csvFile)

      try {
        const questionType = detectQuestionType(csvFile)
        if (!questionType) {
          console.warn(`SEED:   [SKIP] ${relativePath} — could not detect question type from filename`)
          continue
        }

        const content = fs.readFileSync(csvFile, 'utf-8')
        const parsed = Papa.parse<Record<string, string>>(content, {
          header: true, skipEmptyLines: true, dynamicTyping: false,
        })

        if (parsed.errors.length > 0) {
          for (const pe of parsed.errors) {
            console.warn(`SEED:   [PARSE-WARN] ${relativePath} — row ${pe.row ?? '?'}: ${pe.message}`)
          }
        }

        normalizeHeaders(parsed)

        const docs: IQuestion[] = []

        for (const row of parsed.data) {
          try {
            if (isSeparatorRow(row)) continue

            const topic = (row.topic || '').trim()
            const chapter = extractChapter(topic)
            const bloom = (row.bloom_level || '').trim()
            const sloTag = BLOOM_SLO_MAP[bloom]
            const marks = parseNum(row.marks)
            const questionText = (row.question || '').trim()
            if (!questionText) continue

            const base: IQuestion = {
              _id: undefined as unknown as string,
              classLevel,
              subject,
              chapter,
              questionType,
              questionText,
              options: [],
              correctAnswer: row.correct_answer || row.correctanswer || questionText,
              difficulty: (row.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
              marks,
              createdAt: new Date(),
              updatedAt: new Date(),
            }

            if (row.question_hash && row.question_hash.trim() && !row.question_hash.startsWith('sep_')) {
              base._id = row.question_hash.trim()
            }

            if (questionType === 'MCQ') {
              base.options = ['a', 'b', 'c', 'd']
                .map(col => (row[col] || '').trim())
                .filter(v => v !== '')
              base.sloTag = sloTag
            } else if (questionType === 'Short') {
              base.sloTag = sloTag || 'Comprehension'
              base.subType = isNumericalStyle(row.question_style) ? 'Numerical_Reasoning' : 'Theory'
            } else {
              base.sloTag = sloTag || 'Comprehension'
              const qType = (row.question_type || '').toLowerCase()
              const isNum = qType === 'numerical' || isNumericalStyle(row.question_style)
              base.questionCategory = isNum ? 'Long_Numerical' : 'Long_Theory'
              base.subType = isNum ? 'Numerical_Reasoning' : 'Theory'
            }

            docs.push(base)
          } catch (rowErr: any) {
            console.error(`SEED:   [ROW-ERROR] ${relativePath} — ${rowErr.message}`)
          }
        }

        console.log(`SEED:   ${relativePath} — ${questionType} — ${docs.length} rows parsed`)
        if (docs.length === 0) continue

        const idsWithId = docs.filter(d => d._id).map(d => d._id)
        const existingIds = new Set<string>()
        if (idsWithId.length > 0) {
          try {
            const existing = await Question.find({ _id: { $in: idsWithId } }, { _id: 1 }).lean()
            existing.forEach(e => existingIds.add(String(e._id)))
          } catch (dedupErr: any) {
            console.error(`SEED:   [DEDUP-ERROR] ${relativePath} — ${dedupErr.message}`)
          }
        }

        const toInsert = docs.filter(d => !d._id || !existingIds.has(d._id))
        const duplicatesSkipped = docs.length - toInsert.length

        if (toInsert.length > 0) {
          try {
            const result = await Question.insertMany(toInsert, { ordered: false })
            totalInserted += result.length
            subjectInserted += result.length
            if (duplicatesSkipped > 0) {
              totalSkipped += duplicatesSkipped
              subjectSkipped += duplicatesSkipped
            }
            console.log(`SEED:     → Inserted ${result.length}${duplicatesSkipped > 0 ? ` (${duplicatesSkipped} duplicates skipped)` : ''}`)
          } catch (err: any) {
            if (err.name === 'MongoBulkWriteError' || err.name === 'BulkWriteError') {
              const written = err.insertedDocs?.length ?? 0
              if (written > 0) {
                totalInserted += written
                subjectInserted += written
              }
              const failed = err.writeErrors?.length ?? 0
              const fileSkipped = duplicatesSkipped + (toInsert.length - written)
              totalSkipped += fileSkipped
              subjectSkipped += fileSkipped
              console.log(`SEED:     → Inserted ${written}, ${failed} validation failures (total skipped for this file: ${fileSkipped})`)
              for (const we of err.writeErrors || []) {
                console.warn(`SEED:       Write error: ${we.errmsg || we.message}`)
              }
            } else {
              totalSkipped += toInsert.length
              subjectSkipped += toInsert.length
              errors.push(`${relativePath}: ${err.message}`)
              console.error(`SEED:     [FAIL] ${relativePath} — ${err.message}`)
            }
          }
        } else {
          totalSkipped += duplicatesSkipped
          subjectSkipped += duplicatesSkipped
          console.log(`SEED:     → All ${duplicatesSkipped} already exist, nothing to insert`)
        }

        totalParsed += docs.length
        subjectParsed += docs.length
      } catch (fileErr: any) {
        errors.push(`${relativePath}: ${fileErr.message}`)
        console.error(`SEED:   [FILE-ERROR] ${relativePath} — ${fileErr.message}`)
      }
    }

    const elapsed = ((Date.now() - subjectStart) / 1000).toFixed(1)
    console.log(`SEED:   → ${subjectKey} done: ${subjectParsed} parsed, ${subjectInserted} inserted, ${subjectSkipped} skipped (${elapsed}s)`)
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`=== SEED: Complete — ${totalParsed} parsed, ${totalInserted} inserted, ${totalSkipped} skipped (${totalTime}s) ===`)

  return NextResponse.json({
    success: true,
    message: `Seed complete. Parsed: ${totalParsed}, Inserted: ${totalInserted}, Skipped: ${totalSkipped}${errors.length ? `, Errors: ${errors.length}` : ''}`,
    stats: { parsed: totalParsed, inserted: totalInserted, skipped: totalSkipped },
    ...(errors.length ? { errors } : {}),
  })
}
