import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
// 1. Path corrected based on your folder structure
import { connectDB } from '@/lib/mongodb'  // ✅ named import
// 2. Import corrected based on Step 1 Schema
import QuestionModel from '@/models/Question' 

// --------- Strict Curriculum Matrix (Added here to fix import errors) ---------------------------------------------
const CLASS_SUBJECT_MATRIX: Record<string, string[]> = {
  '5': ['Urdu', 'English', 'Islamiyat', 'Mathematics', 'Science', 'Social Studies'],
  '6': ['Urdu', 'English', 'Islamiyat', 'Al Quran', 'Mathematics', 'Science', 'Computer', 'History', 'Geography'],
  '7': ['Urdu', 'English', 'Islamiyat', 'Al Quran', 'Mathematics', 'Science', 'Computer', 'History', 'Geography'],
  '8': ['Urdu', 'English', 'Islamiyat', 'Al Quran', 'Mathematics', 'Science', 'Computer', 'History', 'Geography'],
  '9': ['Urdu', 'English', 'Al Quran', 'Islamiyat (Compulsory)', 'Pak Studies', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer', 'General Mathematics', 'General Science', 'Islamiyat (Elective)', 'Punjabi', 'Home Economics', 'Education', 'Health & Physical Education', 'Poultry', 'Civics', 'Ethics', 'Economics', 'Food & Nutrition'],
  '10': ['Urdu', 'English', 'Al Quran', 'Islamiyat (Compulsory)', 'Pak Studies', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer', 'General Mathematics', 'General Science', 'Islamiyat (Elective)', 'Punjabi', 'Home Economics', 'Education', 'Health & Physical Education', 'Poultry', 'Civics', 'Ethics', 'Economics', 'Food & Nutrition'],
  '11': ['Urdu', 'English', 'Islamiyat (Compulsory)', 'Pak Studies', 'Al Quran', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer', 'Statistics', 'Civics', 'Education', 'Islamiyat (Elective)', 'Punjabi', 'Economics', 'Accounting', 'Business Maths', 'Principles of Commerce', 'Principles of Economics', 'Health & Physical Education', 'Sociology', 'Psychology', 'Physical Geography', 'History of Pakistan', 'Islamic History', 'Ethics', 'Home Economics', 'Library Science'],
  '12': ['Urdu', 'English', 'Islamiyat (Compulsory)', 'Pak Studies', 'Al Quran', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer', 'Statistics', 'Civics', 'Education', 'Islamiyat (Elective)', 'Punjabi', 'Economics', 'Accounting', 'Business Maths', 'Principles of Commerce', 'Principles of Economics', 'Health & Physical Education', 'Sociology', 'Psychology', 'Physical Geography', 'History of Pakistan', 'Islamic History', 'Ethics', 'Home Economics', 'Library Science'],
}

function isSubjectAllowed(classLevel: string, subject: string): boolean {
  const allowed = CLASS_SUBJECT_MATRIX[classLevel]
  return allowed ? allowed.includes(subject) : false
}

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface CSVRow {
  classLevel:    string
  subject:       string
  chapter:       string
  questionType:  string
  questionText:  string
  option_a:      string
  option_b:      string
  option_c:      string
  option_d:      string
  correctAnswer: string
  difficulty:    string
  boardId:       string
  year:          string
  marks:         string
}

interface RowError {
  row:    number
  data:   Partial<CSVRow>
  errors: string[]
}

// --------- CSV column headers (must match exactly) ---------------------------------------------------------------------------------------------------
export const CSV_HEADERS = [
  'classLevel', 'subject', 'chapter', 'questionType', 'questionText',
  'option_a', 'option_b', 'option_c', 'option_d',
  'correctAnswer', 'difficulty', 'boardId', 'year', 'marks',
] as const

// --------- Row-level pre-validation (runs BEFORE hitting MongoDB) ------------------------------------------------------
function validateRow(row: Partial<CSVRow>, rowIndex: number): string[] {
  const errors: string[] = []
  
  // Required fields
  const required: (keyof CSVRow)[] = [
    'classLevel', 'subject', 'chapter',
    'questionType', 'questionText', 'correctAnswer', 'difficulty',
  ]
  
  for (const field of required) {
    if (!row[field] || String(row[field]).trim() === '') {
      errors.push(`Row ${rowIndex}: "${field}" is required and cannot be empty`)
    }
  }
  
  if (errors.length > 0) return errors 

  // Strict curriculum matrix check
  const validLevels = Object.keys(CLASS_SUBJECT_MATRIX)
  if (!validLevels.includes(row.classLevel!.trim())) {
    errors.push(`Row ${rowIndex}: classLevel "${row.classLevel}" is invalid. Must be one of: ${validLevels.join(', ')}`)
  } else if (!isSubjectAllowed(row.classLevel!.trim(), row.subject!.trim())) {
    errors.push(`Row ${rowIndex}: Subject "${row.subject}" is NOT in the curriculum for Class ${row.classLevel}.`)
  }

  // questionType enum
  if (!['MCQ', 'Short', 'Long'].includes(row.questionType!.trim())) {
    errors.push(`Row ${rowIndex}: questionType "${row.questionType}" must be MCQ, Short, or Long`)
  }

  // difficulty enum
  if (!['Easy', 'Medium', 'Hard'].includes(row.difficulty!.trim())) {
    errors.push(`Row ${rowIndex}: difficulty "${row.difficulty}" must be Easy, Medium, or Hard`)
  }

  return errors
}

// --------- Transform CSV row → Mongoose-ready object ---------------------------------------------------------------------------------------------
function transformRow(row: CSVRow) {
  const options: string[] = []
  if (row.option_a?.trim()) options.push(row.option_a.trim())
  if (row.option_b?.trim()) options.push(row.option_b.trim())
  if (row.option_c?.trim()) options.push(row.option_c.trim())
  if (row.option_d?.trim()) options.push(row.option_d.trim())
  
  return {
    classLevel:    row.classLevel.trim(),
    subject:       row.subject.trim(),
    chapter:       row.chapter.trim(),
    questionType:  row.questionType.trim() as 'MCQ' | 'Short' | 'Long',
    questionText:  row.questionText.trim(),
    options:       options.length > 0 ? options : undefined,
    correctAnswer: row.correctAnswer.trim(),
    difficulty:    row.difficulty.trim() as 'Easy' | 'Medium' | 'Hard',
    boardId:       row.boardId?.trim()  || undefined,
    year:          row.year?.trim()     ? Number(row.year)  : undefined,
    marks:         row.marks?.trim()    ? Number(row.marks) : undefined,
    createdBy:     'admin-system', // Default admin for bulk
  }
}

// --------- POST Handler (Upload Processing) ---------------------------------------------------------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file || !file.name.endsWith('.csv')) {
    return NextResponse.json({ error: 'Only .csv files are accepted' }, { status: 400 })
  }

  const csvText = await file.text()
  if (!csvText.trim()) {
    return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 })
  }

  const parsed = Papa.parse<CSVRow>(csvText, {
    header:           true,
    skipEmptyLines:   true,
    transformHeader:  (h) => h.trim(),
    transform:        (v) => v.trim(),
  })

  if (parsed.errors.length > 0) {
    return NextResponse.json({ error: 'CSV parse error', details: parsed.errors.map(e => e.message) }, { status: 400 })
  }

  const rows = parsed.data
  const validDocs: ReturnType<typeof transformRow>[] = []
  const rowErrors: RowError[] = []

  rows.forEach((row, i) => {
    const rowNumber = i + 2 // +2 because index is 0-based and row 1 is headers
    const errors = validateRow(row, rowNumber)
    if (errors.length > 0) {
      rowErrors.push({ row: rowNumber, data: row, errors })
    } else {
      validDocs.push(transformRow(row as CSVRow))
    }
  })

  try {
    // Database connection using the corrected path
    if (typeof connectDB === 'function') {
      await connectDB()
    } else if (connectDB && typeof (connectDB as any).default === 'function') {
       await (connectDB as any).default()
    }
  } catch {
    return NextResponse.json({ error: 'Database connection failed.' }, { status: 503 })
  }

  let insertedCount = 0
  const mongoErrors: RowError[] = []

  if (validDocs.length > 0) {
    try {
      const result = await QuestionModel.insertMany(validDocs, { ordered: false })
      insertedCount = result.length
    } catch (err: any) {
      if (err.result && err.writeErrors) {
        insertedCount = err.result.nInserted
        err.writeErrors.forEach((we: any) => {
          mongoErrors.push({ row: we.index + 2, data: validDocs[we.index] as any, errors: [we.errmsg] })
        })
      } else {
        return NextResponse.json({ error: 'Unexpected DB error', details: String(err) }, { status: 500 })
      }
    }
  }

  const result = {
    totalRows: rows.length,
    inserted: insertedCount,
    failed: rowErrors.length + mongoErrors.length,
    skipped: rows.length - validDocs.length,
    errors: [...rowErrors, ...mongoErrors].slice(0, 20),
    duration_ms: Date.now() - startTime,
  }

  return NextResponse.json(result, { status: insertedCount > 0 ? 200 : 422 })
}

// --------- GET Handler (Download Template) ------------------------------------------------------------------------------------------------------------------------------
export async function GET() {
  const csvContent = CSV_HEADERS.join(',') + '\n' +
    '9,Physics,Chapter 1,MCQ,What is the unit of force?,Joule,Newton,Pascal,Watt,Newton,Medium,BISE Lahore,2023,1\n' +
    '10,Urdu,Chapter 2,Short,What is the theme of the poem?,,,,,Theme is nature.,Easy,BISE Lahore,2024,2\n'

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="zeeshaoor_questions_template.csv"',
    },
  })
}