// ============================================================
// scripts/importQuestions.ts
// ZeeShaoor.pk — CSV to MongoDB Importer
// ============================================================

import fs from 'fs'
import mongoose from 'mongoose'
import Papa from 'papaparse'
import QuestionModel from '../src/models/Question'

function parseCsv(raw: string): Record<string, string>[] {
  const withoutBom = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
  const result = Papa.parse<Record<string, string>>(withoutBom, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  })
  return result.data
}

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI nahi mila! .env.local check karo')
  process.exit(1)
}

const CHAPTERS = [
  {
    chapter: 1,
    name: 'Physical Quantities and Measurements',
    mcq:   'data/9th_Physics/9th_Physics_ch_1/Class_9_Physics_Ch_1_MCQs.csv',
    short: 'data/9th_Physics/9th_Physics_ch_1/Physics_Class9_Ch1_ShortQuestions_.csv',
    long:  'data/9th_Physics/9th_Physics_ch_1/Class_9_Physics_Ch1_Long_and_Numericals.csv',
  },
  {
    chapter: 2,
    name: 'Kinematics',
    mcq:   'data/9th_Physics/9th_Physics_ch_2/Class9_Physics_Ch2_Kinematics_MCQs.csv',
    short: 'data/9th_Physics/9th_Physics_ch_2/Kinematics_Short_Questions.csv',
    long:  'data/9th_Physics/9th_Physics_ch_2/Kinematics_long Questions.csv',
  },
  {
    chapter: 3,
    name: 'Dynamics',
    mcq:   'data/9th_Physics/9th_Physics_ch_3/Physics_Class9_Ch3_MCQs .csv',
    short: 'data/9th_Physics/9th_Physics_ch_3/physics_chapter3_short_questions.csv',
    long:  'data/9th_Physics/9th_Physics_ch_3/Physics_Class9_Ch3_Long_Numericals.csv',
  },
]

let inserted = 0
let skipped  = 0
let errors   = 0

function mapDifficulty(val: string): 'Easy' | 'Medium' | 'Hard' {
  const v = (val || '').toLowerCase().trim()
  if (v === 'easy') return 'Easy'
  if (v === 'hard') return 'Hard'
  return 'Medium'
}

async function importMCQs(filePath: string, chapterName: string) {
  if (!fs.existsSync(filePath)) { console.warn(`⚠️  File nahi mili: ${filePath}`); return }

  const raw   = fs.readFileSync(filePath, 'utf-8')
  const lines = raw.split('\n')
  const start = lines.findIndex((l: string) => l.includes('question_hash'))
  if (start === -1) { console.warn('⚠️  MCQ header nahi mila'); return }

  const records = parseCsv(lines.slice(start).join('\n'))

  for (const row of records) {
    if (!row['question'] || !row['question_hash']) { skipped++; continue }
    const options = [row['A'], row['B'], row['C'], row['D']].filter(Boolean)
    if (options.length < 2) { skipped++; continue }

    try {
      await QuestionModel.findOneAndUpdate(
        { _id: row['question_hash'] },
        { $setOnInsert: {
            _id:           row['question_hash'],
            classLevel:    '9',
            subject:       'Physics',
            chapter:       chapterName,
            questionType:  'MCQ',
            questionText:  row['question'].trim(),
            options,
            correctAnswer: (row['correct_answer'] || '').trim(),
            difficulty:    mapDifficulty(row['difficulty']),
            marks:         parseInt(row['marks']) || 1,
        }},
        { upsert: true, new: false }
      )
      inserted++
    } catch (e: unknown) {
      console.error(`❌ MCQ [${row['question_hash']}]:`, (e as Error).message)
      errors++
    }
  }
}

async function importShortQuestions(filePath: string, chapterName: string) {
  if (!fs.existsSync(filePath)) { console.warn(`⚠️  File nahi mili: ${filePath}`); return }

  const records = parseCsv(fs.readFileSync(filePath, 'utf-8'))

  for (const row of records) {
    if (!row['question'] || !row['question_hash']) { skipped++; continue }

    try {
      await QuestionModel.findOneAndUpdate(
        { _id: row['question_hash'] },
        { $setOnInsert: {
            _id:           row['question_hash'],
            classLevel:    '9',
            subject:       'Physics',
            chapter:       chapterName,
            questionType:  'Short',
            questionText:  row['question'].trim(),
            options:       [],
            correctAnswer: (row['answer'] || '').trim(),
            difficulty:    mapDifficulty(row['difficulty']),
            marks:         parseInt(row['marks']) || 2,
        }},
        { upsert: true, new: false }
      )
      inserted++
    } catch (e: unknown) {
      console.error(`❌ Short [${row['question_hash']}]:`, (e as Error).message)
      errors++
    }
  }
}

async function importLongQuestions(filePath: string, chapterName: string) {
  if (!fs.existsSync(filePath)) { console.warn(`⚠️  File nahi mili: ${filePath}`); return }

  const records = parseCsv(fs.readFileSync(filePath, 'utf-8'))

  for (const row of records) {
    if (!row['question'] || !row['question_hash']) { skipped++; continue }

    try {
      await QuestionModel.findOneAndUpdate(
        { _id: row['question_hash'] },
        { $setOnInsert: {
            _id:           row['question_hash'],
            classLevel:    '9',
            subject:       'Physics',
            chapter:       chapterName,
            questionType:  'Long',
            questionText:  row['question'].trim(),
            options:       [],
            correctAnswer: (row['answer'] || '').trim(),
            difficulty:    mapDifficulty(row['difficulty']),
            marks:         parseInt(row['marks']) || 5,
        }},
        { upsert: true, new: false }
      )
      inserted++
    } catch (e: unknown) {
      console.error(`❌ Long [${row['question_hash']}]:`, (e as Error).message)
      errors++
    }
  }
}

async function main() {
  console.log('🔌 MongoDB se connect ho raha hai...')
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected!\n')

  for (const ch of CHAPTERS) {
    console.log(`📖 Chapter ${ch.chapter}: ${ch.name}`)
    await importMCQs(ch.mcq, ch.name)
    await importShortQuestions(ch.short, ch.name)
    await importLongQuestions(ch.long, ch.name)
    console.log(`   ✅ Chapter ${ch.chapter} done!\n`)
  }

  console.log('═══════════════════════════════════')
  console.log(`✅ Inserted : ${inserted}`)
  console.log(`⏭️  Skipped  : ${skipped}`)
  console.log(`❌ Errors   : ${errors}`)
  console.log('═══════════════════════════════════')

  await mongoose.disconnect()
  console.log('🔌 Disconnect ho gaya.')
}

main().catch(err => {
  console.error('💥 Script crash:', err)
  process.exit(1)
})