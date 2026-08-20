// Dry-run of the seed-questions parse pipeline. Reads only; writes nothing.
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

const DATA_ROOT = path.join(process.cwd(), 'data')
const BLOOM_SLO_MAP = {
  Remember: 'Knowledge', Understand: 'Comprehension', Apply: 'Application',
  Analyze: 'Application', Evaluate: 'Application', Create: 'Application',
}
const CLASS_SUBJECT_MATRIX_9 = ['Physics', 'Chemistry', 'Biology', 'Computer', 'Mathematics']

function parseClassSubjectFromFolder(f) {
  const m = f.match(/^(\d+)th_(.+)$/i)
  if (!m) return null
  let s = m[2]
  return { classLevel: m[1], subject: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() }
}
function parseMetaFromFilename(fn) {
  const name = fn.replace(/\.csv$/i, '')
  const m = name.match(/^class_(\d+)_([a-z]+?)(?:_ch(?:apter)?_\d+|_\d+|$)/i)
  if (!m) return null
  let s = m[2]
  return { classLevel: m[1], subject: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() }
}
function collectFiles(dir, inherited) {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...collectFiles(full, parseClassSubjectFromFolder(e.name) ?? inherited))
    else if (e.name.toLowerCase().endsWith('.csv')) {
      const meta = inherited ?? parseMetaFromFilename(e.name)
      if (meta) out.push({ filePath: full, ...meta })
      else out.push({ filePath: full, SKIP: 'no class/subject' })
    }
  }
  return out
}
function detectQuestionType(fp) {
  const n = path.basename(fp).toLowerCase()
  if (n.includes('mcq')) return 'MCQ'
  if (n.includes('long')) return 'Long'
  if (n.includes('short')) return 'Short'
  return null
}
const extractChapter = t => (t.match(/^(\d+)/) ? t.match(/^(\d+)/)[1] : t)
function isSeparatorRow(r) {
  if (!r.question || r.question.trim() === '') return true
  if (r.question_hash === 'TOPIC_SEP') return true
  if ((r.question_hash || '').startsWith('sep_')) return true
  if ((r.question_type || '').toLowerCase() === 'topic') return true
  if ((r.question_style || '').toLowerCase() === 'topic_separator') return true
  return false
}
function normalizeHeaders(parsed) {
  if (!parsed.meta.fields) return
  const lowerMap = new Map()
  for (const f of parsed.meta.fields) lowerMap.set(f.toLowerCase().trim(), f)
  for (const row of parsed.data)
    for (const [lower, orig] of lowerMap)
      if (lower !== orig && row[orig] !== undefined) row[lower] = row[orig]
}

const files = collectFiles(DATA_ROOT, null)
console.log(`Discovered ${files.length} CSV files\n`)

const chapterValues = new Set()
const subjectValues = new Set()
let grandTotal = 0, grandSkipped = 0
const noTypeFiles = []
const wouldFailValidation = []

for (const f of files) {
  if (f.SKIP) { console.log(`[SKIP-META] ${path.relative(DATA_ROOT, f.filePath)}`); continue }
  const rel = path.relative(DATA_ROOT, f.filePath)
  const qt = detectQuestionType(f.filePath)
  if (!qt) { noTypeFiles.push(rel); continue }

  const parsed = Papa.parse(fs.readFileSync(f.filePath, 'utf-8'), {
    header: true, skipEmptyLines: true, dynamicTyping: false,
  })
  normalizeHeaders(parsed)

  let kept = 0, sep = 0, noOpts = 0
  for (const row of parsed.data) {
    if (isSeparatorRow(row)) { sep++; continue }
    const topic = (row.topic || '').trim()
    const chapter = extractChapter(topic)
    chapterValues.add(chapter)
    if (qt === 'MCQ') {
      const opts = ['a', 'b', 'c', 'd'].map(c => (row[c] || '').trim()).filter(v => v !== '')
      if (opts.length < 2) noOpts++
    }
    kept++
  }
  subjectValues.add(`${f.classLevel}/${f.subject}`)
  grandTotal += kept
  grandSkipped += sep
  if (noOpts > 0) wouldFailValidation.push(`${rel}: ${noOpts} MCQ rows with <2 options`)
  console.log(`${rel}\n    type=${qt} class=${f.classLevel} subject=${f.subject} kept=${kept} sepRows=${sep}`)
}

console.log(`\n===== SUMMARY =====`)
console.log(`Rows that would insert : ${grandTotal}`)
console.log(`Separator rows skipped : ${grandSkipped}`)
console.log(`\nclass/subject pairs    : ${JSON.stringify([...subjectValues])}`)
console.log(`\nDISTINCT chapter values the seeder would write:`)
console.log(`  ${JSON.stringify([...chapterValues].sort())}`)
console.log(`\nFiles with undetectable question type: ${noTypeFiles.length}`)
noTypeFiles.forEach(f => console.log(`  ${f}`))
console.log(`\nMCQ option problems:`)
wouldFailValidation.forEach(f => console.log(`  ${f}`))
