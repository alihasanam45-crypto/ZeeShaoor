// ============================================================
// scripts/importQuestions.ts
// ZeeShaoor.pk — CSV to MongoDB Importer (auto-discovery, all classes/subjects)
//
// Fix history:
//  - bulk writes + per-file progress logging (fast import)
//  - subject spelling now matches CLASS_SUBJECT_MATRIX in src/models/Question.ts
//    EXACTLY ("Mathematics" not "Maths", "Islamiyat (Compulsory)" not "Islamiat")
//  - `chapter` is now the bare NUMBER ("1", "14"...) as the Question schema
//    requires (/^\d{1,2}$/); the prose name goes in `chapterName` instead
//  - uses $set (not $setOnInsert) so re-running this script FIXES bad data
//    already in the database instead of silently skipping it
//  - English/Urdu folders are skipped for now: their CSVs are organised by
//    topic, not by numbered chapters, so they don't fit the numeric `chapter`
//    field yet — add them once a chapter model is decided
// ============================================================

import { config } from 'dotenv'
config({ path: '.env.local' })

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import mongoose from 'mongoose'
import Papa from 'papaparse'
import QuestionModel from '../src/models/Question'
import { chapterFromFilename, chapterName as lookupChapterName } from '../src/data/chapter-registry'

const DATA_DIR = path.join(process.cwd(), 'data')
const BATCH_SIZE = 500 // how many questions per bulkWrite call

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI nahi mila! .env.local check karo')
  process.exit(1)
}

const RESET = process.argv.includes('--reset')

let inserted = 0
let skipped = 0
let errors = 0
let filesProcessed = 0
let foldersSkipped = 0

// ---------------------------------------------------------------
// CSV parsing helper
// ---------------------------------------------------------------
function parseCsv(raw: string): Record<string, string>[] {
  const withoutBom = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
  const result = Papa.parse<Record<string, string>>(withoutBom, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => (typeof v === 'string' ? v.trim() : v),
  })
  return result.data
}

function mapDifficulty(val: string | undefined): 'Easy' | 'Medium' | 'Hard' {
  const v = (val || '').toLowerCase().trim()
  if (v === 'easy') return 'Easy'
  if (v === 'hard') return 'Hard'
  return 'Medium'
}

// ---------------------------------------------------------------
// Recursively find every .csv under a folder
// ---------------------------------------------------------------
function findAllCsvFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...findAllCsvFiles(full))
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.csv')) {
      out.push(full)
    }
  }
  return out
}

// ---------------------------------------------------------------
// Folder name -> class + subject
//   "9th_Physics"   -> class "9",  subject "Physics"
//   "10th_computer" -> class "10", subject "Computer"
// ---------------------------------------------------------------
const FOLDER_PATTERN = /^(\d{1,2})(?:st|nd|rd|th)?[\s_-]+(.+)$/i

// Raw folder-name fragment (lowercased) -> canonical subject name.
// Values MUST match CLASS_SUBJECT_MATRIX in src/models/Question.ts exactly.
// 'islamiat'/'islamiyat' are handled separately below (name depends on class).
const SUBJECT_NORMALIZE: Record<string, string> = {
  'math': 'Mathematics',
  'maths': 'Mathematics',
  'mathematics': 'Mathematics',
  'computer': 'Computer',
  'computer science': 'Computer',
  'chemistry': 'Chemistry',
  'biology': 'Biology',
  'physics': 'Physics',
  'urdu': 'Urdu',
}

// Folders whose content is skipped entirely for this pass — their CSVs are
// organised by topic (grammar drills, comprehension, letters), not by
// numbered textbook chapters, so they don't fit the numeric `chapter` field.
// Remove an entry here once that subject has a real chapter model.
const SKIPPED_SUBJECTS = new Set(['english'])

function normalizeSubject(classLevel: string, rawFolderSubject: string): string | null {
  const cleaned = rawFolderSubject.replace(/[_-]+/g, ' ').trim().toLowerCase()

  if (SKIPPED_SUBJECTS.has(cleaned)) return null

  if (cleaned === 'islamiat' || cleaned === 'islamiyat') {
    const classNum = parseInt(classLevel, 10)
    // CLASS_SUBJECT_MATRIX: classes 9-12 use "Islamiyat (Compulsory)",
    // classes 5-8 use plain "Islamiyat".
    return classNum >= 9 ? 'Islamiyat (Compulsory)' : 'Islamiyat'
  }

  if (SUBJECT_NORMALIZE[cleaned]) return SUBJECT_NORMALIZE[cleaned]

  // Fall back to Title Case for anything not explicitly mapped, e.g. a new
  // subject folder added later ("science" -> "Science").
  return cleaned.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function parseClassSubjectFromTopFolder(topFolder: string): { classLevel: string; rawSubject: string } | null {
  const m = FOLDER_PATTERN.exec(topFolder.trim())
  if (!m) return null
  return { classLevel: m[1], rawSubject: m[2] }
}

// ---------------------------------------------------------------
// Question type from filename, falling back to column shape
// ---------------------------------------------------------------
function detectQuestionType(fileName: string, columns: string[]): 'MCQ' | 'Short' | 'Long' {
  const lower = fileName.toLowerCase()
  if (lower.includes('mcq')) return 'MCQ'
  if (lower.includes('short')) return 'Short'
  if (lower.includes('long') || lower.includes('numerical')) return 'Long'
  const lowerCols = columns.map(c => c.toLowerCase())
  if (['a', 'b', 'c', 'd'].every(k => lowerCols.includes(k))) return 'MCQ'
  return 'Short'
}

function marksForType(type: 'MCQ' | 'Short' | 'Long', row: Record<string, string>): number {
  if (type === 'MCQ') return parseInt(row['marks']) || 1
  if (type === 'Short') return parseInt(row['marks']) || 2
  const qType = (row['question_type'] || '').toLowerCase()
  if (qType === 'numerical') return parseInt(row['marks']) || 4
  return parseInt(row['marks']) || 5
}

function makeId(row: Record<string, string>, filePath: string, index: number): string {
  if (row['question_hash']) return row['question_hash']
  const raw = `${filePath}::${index}::${row['question'] || ''}`
  return crypto.createHash('md5').update(raw).digest('hex')
}

// ---------------------------------------------------------------
// Flush a batch of upsert operations in ONE round-trip to MongoDB.
// $set (not $setOnInsert) so re-running this script REPAIRS documents
// that were previously written with the wrong chapter/subject format.
// ---------------------------------------------------------------
async function flushBatch(ops: any[]) {
  if (ops.length === 0) return
  try {
    const res = await QuestionModel.bulkWrite(ops, { ordered: false })
    inserted += (res.upsertedCount ?? 0) + (res.modifiedCount ?? 0)
  } catch (e: unknown) {
    const err = e as any
    const writeErrors = err?.writeErrors?.length ?? 0
    inserted += Math.max(0, ops.length - writeErrors)
    errors += writeErrors
    if (writeErrors === 0) {
      console.error('   ❌ Batch error:', err?.message || err)
      errors += ops.length
      inserted -= ops.length
    }
  }
}

// ---------------------------------------------------------------
// Import one CSV file (builds bulk ops, flushes in batches)
// ---------------------------------------------------------------
async function importFile(filePath: string, classLevel: string, subject: string) {
  const fileName = path.basename(filePath)
  const raw = fs.readFileSync(filePath, 'utf-8')

  const lines = raw.split('\n')
  let startIdx = lines.findIndex(l => /question/i.test(l) && l.includes(','))
  if (startIdx === -1) startIdx = 0
  const csvText = lines.slice(startIdx).join('\n')

  const records = parseCsv(csvText)
  if (records.length === 0) {
    console.warn(`   ⚠️  Empty/unparseable: ${fileName}`)
    return
  }

  const columns = Object.keys(records[0])
  const type = detectQuestionType(fileName, columns)

  const chapterNo = chapterFromFilename(fileName)
  if (!chapterNo) {
    console.warn(`   ⚠️  No chapter number in filename, skipping: ${fileName}`)
    skipped += records.length
    return
  }
  const chapterLabel = lookupChapterName(classLevel, subject, chapterNo)

  let ops: any[] = []
  let idx = 0

  for (const row of records) {
    idx++
    const questionText = row['question'] || row['Question'] || ''
    if (!questionText.trim()) { skipped++; continue }

    const options = type === 'MCQ'
      ? [row['A'], row['B'], row['C'], row['D']].filter(Boolean)
      : []
    if (type === 'MCQ' && options.length < 2) { skipped++; continue }

    const id = makeId(row, filePath, idx)

    ops.push({
      updateOne: {
        filter: { _id: id },
        update: { $set: {
            _id: id,
            classLevel,
            subject,
            chapter: chapterNo,        // bare number — required by the schema
            chapterName: chapterLabel, // prose — display only, never matched on
            questionType: type,
            questionText: questionText.trim(),
            options,
            correctAnswer: (row['correct_answer'] || row['answer'] || '').trim(),
            difficulty: mapDifficulty(row['difficulty']),
            marks: marksForType(type, row),
        }},
        upsert: true,
      }
    })

    if (ops.length >= BATCH_SIZE) {
      await flushBatch(ops)
      ops = []
    }
  }

  await flushBatch(ops)

  filesProcessed++
  console.log(`   📄 [${filesProcessed}] ${fileName}  (${records.length} rows, type=${type}, chapter=${chapterNo})`)
}

// ---------------------------------------------------------------
// Discover jobs
// ---------------------------------------------------------------
function discoverJobs(): Array<{ classLevel: string; subject: string; pdfLikeFiles: string[] }> {
  const jobs: Array<{ classLevel: string; subject: string; pdfLikeFiles: string[] }> = []

  const topFolders = fs.readdirSync(DATA_DIR, { withFileTypes: true }).filter(e => e.isDirectory())

  for (const top of topFolders) {
    const parsed = parseClassSubjectFromTopFolder(top.name)
    if (!parsed) {
      console.warn(`⚠️  Folder naam samajh nahi aaya, skip: ${top.name}`)
      foldersSkipped++
      continue
    }
    const { classLevel, rawSubject } = parsed
    const subject = normalizeSubject(classLevel, rawSubject)
    if (!subject) {
      console.warn(`⏭️  Skipping folder (not chapter-based yet): ${top.name}`)
      foldersSkipped++
      continue
    }

    const topPath = path.join(DATA_DIR, top.name)
    const csvFiles = findAllCsvFiles(topPath)
    if (csvFiles.length === 0) continue

    jobs.push({ classLevel, subject, pdfLikeFiles: csvFiles })
  }

  return jobs
}

// ---------------------------------------------------------------
// Main
// ---------------------------------------------------------------
async function main() {
  console.log('🔌 MongoDB se connect ho raha hai...')
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected!\n')

  if (RESET) {
    console.log('🗑️  --reset flag diya gaya hai: puri "questions" collection delete ki ja rahi hai...')
    const { deletedCount } = await QuestionModel.deleteMany({})
    console.log(`   Deleted ${deletedCount} document(s).\n`)
  }

  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ 'data' folder nahi mila: ${DATA_DIR}`)
    process.exit(1)
  }

  const jobs = discoverJobs()
  console.log(`>> ${jobs.length} class/subject combo(s) mile. Processing shuru...\n`)

  for (const job of jobs) {
    console.log(`📖 Class ${job.classLevel} - ${job.subject}  (${job.pdfLikeFiles.length} files)`)
    for (const filePath of job.pdfLikeFiles) {
      await importFile(filePath, job.classLevel, job.subject)
    }
    console.log(`   ✅ Done: ${job.subject}  |  running totals -> inserted:${inserted} skipped:${skipped} errors:${errors}\n`)
  }

  console.log('═══════════════════════════════════')
  console.log(`✅ Inserted/Updated : ${inserted}`)
  console.log(`⏭️  Skipped          : ${skipped}`)
  console.log(`❌ Errors           : ${errors}`)
  console.log(`📁 Folders skipped  : ${foldersSkipped}`)
  console.log('═══════════════════════════════════')

  await mongoose.disconnect()
  console.log('🔌 Disconnect ho gaya.')
}

main().catch(err => {
  console.error('💥 Script crash:', err)
  process.exit(1)
})