import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local', quiet: true })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const q = client.db().collection('questions')

const CHAPTER_MAP = {
  physics: {
    '1': 'Physical Quantities and Measurements',
    '2': 'Kinematics', '3': 'Dynamics', '4': 'Turning Effect of Forces',
    '5': 'Gravitation', '6': 'Work and Energy', '7': 'Properties of Matter',
    '8': 'Thermal Properties of Matter', '9': 'Transfer of Heat',
  },
  default: Object.fromEntries([...Array(12)].map((_, i) => [String(i + 1), `Chapter ${i + 1}`])),
}

// Exactly mirrors src/app/api/generator/route.ts
function buildBaseQuery(cls, subject, chapter) {
  const cleanClass = String(cls).replace(/^(Class\s*)/i, '').replace(/th|st|nd|rd/gi, '').trim()
  const subjectKey = subject.toLowerCase().includes('physics') ? 'physics'
    : subject.toLowerCase().includes('chemistry') ? 'chemistry'
    : subject.toLowerCase().includes('biology') ? 'biology' : 'default'
  const base = { classLevel: cleanClass, subject }
  if (chapter && chapter !== 'mixed' && chapter !== 'mix') {
    const chMap = CHAPTER_MAP[subjectKey] || CHAPTER_MAP.default
    const cleanChapter = String(chapter).replace(/^ch\s*/i, '').trim()
    base.chapter = chMap[cleanChapter] || cleanChapter
  }
  return base
}

const scenarios = [
  ['Class 9 Physics — mixed',      'Class 9',  'Physics',  'mixed'],
  ['Class 9 Physics — ch1',        'Class 9',  'Physics',  'ch1'],
  ['Class 9 Physics — ch2',        'Class 9',  'Physics',  'ch2'],
  ['Class 9 Physics — ch4',        'Class 9',  'Physics',  'ch4'],
  ['Class 9 Physics — ch5',        'Class 9',  'Physics',  'ch5'],
  ['Class 10 Computer — mixed',    'Class 10', 'Computer', 'mixed'],
  ['Class 10 Computer — ch1',      'Class 10', 'Computer', 'ch1'],
  ['Class 9 Maths — mixed',        'Class 9',  'Maths',    'mixed'],
]

for (const [label, cls, subj, ch] of scenarios) {
  const base = buildBaseQuery(cls, subj, ch)
  const counts = {}
  for (const t of ['MCQ', 'Short', 'Long']) {
    counts[t] = await q.countDocuments({ ...base, questionType: t })
  }
  const total = counts.MCQ + counts.Short + counts.Long
  const flag = total === 0 ? '  <-- 404 "Koi questions nahi mile"' : ''
  console.log(`${label.padEnd(30)} ${JSON.stringify(base)}`)
  console.log(`${''.padEnd(30)} MCQ=${counts.MCQ} Short=${counts.Short} Long=${counts.Long} TOTAL=${total}${flag}\n`)
}

// Long-question category split — the LQ engine filters on questionCategory
console.log('--- questionCategory on Long questions (class 9 Physics) ---')
const cats = await q.aggregate([
  { $match: { classLevel: '9', subject: 'Physics', questionType: 'Long' } },
  { $group: { _id: '$questionCategory', n: { $sum: 1 } } },
]).toArray()
console.log(cats.map(c => `  ${c._id ?? '(missing)'}: ${c.n}`).join('\n'))

console.log('\n--- boardTags / region coverage (board mode tiers) ---')
console.log('  with boardTags:', await q.countDocuments({ boardTags: { $exists: true, $ne: null } }))
console.log('  with region   :', await q.countDocuments({ region: { $exists: true, $ne: null } }))

console.log('\n--- duplicate questionText ---')
const dupes = await q.aggregate([
  { $group: { _id: { t: '$questionText', c: '$classLevel', s: '$subject' }, n: { $sum: 1 } } },
  { $match: { n: { $gt: 1 } } },
  { $count: 'groups' },
]).toArray()
console.log('  duplicate groups:', dupes[0]?.groups ?? 0)

await client.close()
