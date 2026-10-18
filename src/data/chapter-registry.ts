// src/data/chapter-registry.ts
//
// SINGLE SOURCE OF TRUTH for chapter identity.
//
// Why this file exists
// --------------------
// Chapters used to be identified by their prose name, written independently in
// three places: the CSV seeder derived one string from the topic column, the
// generator API held a hardcoded CHAPTER_MAP, and the UI held a third list.
// The three disagreed (the API mapped Class 9 Physics ch5 to "Gravitation"
// while the book and the CSVs call it "Work, Energy and Power"), so every
// chapter-filtered query matched zero documents.
//
// The fix is to stop treating the prose name as an identity. `chapter` in the
// database is the chapter NUMBER as a string ("1".."26") — unambiguous, stable
// under renaming and translation, and derivable straight from a filename.
// Prose names live here, for display only, and are never used to match.
//
// IMPORTANT: chaptersFor() below drives the chapter picker in the generator
// UI. A class+subject with NO entry here shows "Chapter data coming soon" and
// cannot be selected at all, even if the database already has questions for
// it — so every subject enabled in src/config/curriculum.ts MUST have an
// entry here (exact titles are not load-bearing; only the chapter COUNT and
// NUMBERING matter for the UI/DB to line up).

export type ChapterNumber = string

/** Build { [n]: "Chapter n" } for n in [start, end] — a placeholder title set
 *  for subjects whose official BISE chapter titles have not been transcribed
 *  yet. Safe to use as-is; correct the wording later without touching any
 *  query, since only the numeric key is load-bearing. */
function placeholderRange(start: number, end: number): Record<ChapterNumber, string> {
  const out: Record<ChapterNumber, string> = {}
  for (let n = start; n <= end; n++) out[String(n)] = `Chapter ${n}`
  return out
}

/** Canonical display names, keyed by `<classLevel>:<Subject>`. */
const CHAPTER_NAMES: Record<string, Record<ChapterNumber, string>> = {
  // Authoritative: mirrors src/data/ninthPhysicsChapters.ts, which is the list
  // the teacher actually clicks in the generator UI, and matches the CSV files
  // in data/9th_Physics/ one-for-one.
  '9:Physics': {
    '1': 'Physical Quantities and Measurements',
    '2': 'Kinematics',
    '3': 'Dynamics',
    '4': 'Turning Effects of Force',
    '5': 'Work, Energy and Power',
    '6': 'Mechanical Properties of Matter',
    '7': 'Thermal Properties of Matter',
    '8': 'Magnetism',
    '9': 'Nature of Science',
  },

  // Class 10 Physics continues the chapter numbering from Class 9 (10, 11,
  // 12...) — matches data/10th_physics/class_10_physics_chapter_10..21.
  '10:Physics': placeholderRange(10, 21),

  // Derived from the `topic` column of data/10th_computer/*.csv (e.g. ch1's
  // topics all sit under "1.1 Introduction to Operating System (OS)"). These
  // are inferred from the source material rather than transcribed from an
  // official syllabus — correct them here if the board wording differs. Only
  // the numbers are load-bearing; changing a name here cannot break a query.
  '10:Computer': {
    '1': 'Operating Systems',
    '2': 'Troubleshooting and System Maintenance',
    '3': 'Python Programming',
    '4': 'Control Structures',
    '5': 'Data Science',
    '6': 'Artificial Intelligence and Machine Learning',
    '7': 'Impact of Artificial Intelligence',
    '8': 'Entrepreneurship in the Digital Age',
  },

  // Placeholder titles below — counts verified against the CSV filenames in
  // data/<class>_<subject>/, wording not yet transcribed from the textbooks.
  '9:Chemistry':   placeholderRange(1, 13),
  '9:Biology':     placeholderRange(1, 11),
  '9:Mathematics': placeholderRange(1, 13),
  '9:Computer':    placeholderRange(1, 9),
  '9:Islamiyat (Compulsory)': placeholderRange(1, 7),

  '10:Chemistry':   placeholderRange(14, 26),
  '10:Biology':     placeholderRange(1, 10),
  '10:Mathematics': placeholderRange(1, 12),
  '10:Islamiyat (Compulsory)': placeholderRange(1, 7),
}

function key(classLevel: string, subject: string): string {
  return `${classLevel}:${subject}`
}

/**
 * Normalize whatever the client sent into a bare chapter number.
 * Accepts "ch4", "Ch 4", "chapter_4", "4", 4 — all become "4".
 * Returns null for "mixed"/"mix"/empty, meaning "do not filter by chapter".
 */
export function normalizeChapter(input: unknown): ChapterNumber | null {
  if (input === null || input === undefined) return null
  const raw = String(input).trim()
  if (raw === '' || raw.toLowerCase() === 'mixed' || raw.toLowerCase() === 'mix') return null
  const m = raw.match(/(\d+)/)
  return m ? m[1] : null
}

/**
 * Extract a chapter number from a CSV filename. This is the seeder's only
 * chapter source: filenames are consistently numbered ("ch2_kinematics_...",
 * "chapter_4_turning_effects...", "class_9_physics_ch1_mcqs.csv", or
 * "Bab_3_..." for Islamiyat), whereas the topic column mixes numbered
 * headings with free prose like "Exercise MCQs".
 *
 * Note the `ch(?:apter)?` alternation cannot match the "cl" of "class_9", so a
 * class number is never mistaken for a chapter number.
 */
export function chapterFromFilename(filename: string): ChapterNumber | null {
  const patterns = [
    /ch(?:apter)?[_\-\s]?(\d{1,2})/i,
    /bab[_\-\s]?(\d{1,2})/i,
  ]
  for (const p of patterns) {
    const m = filename.match(p)
    if (m) return String(Number(m[1]))
  }
  return null
}

/** Display name for a chapter. Falls back to "Chapter N" when unregistered. */
export function chapterName(classLevel: string, subject: string, chapter: ChapterNumber): string {
  return CHAPTER_NAMES[key(classLevel, subject)]?.[chapter] ?? `Chapter ${chapter}`
}

/** Every registered chapter for a class+subject, ordered. Empty if unregistered. */
export function chaptersFor(classLevel: string, subject: string): Array<{ id: ChapterNumber; name: string }> {
  const map = CHAPTER_NAMES[key(classLevel, subject)]
  if (!map) return []
  return Object.keys(map)
    .sort((a, b) => Number(a) - Number(b))
    .map((id) => ({ id, name: map[id] }))
}

/**
 * Reverse lookup: prose name -> chapter number. Used only by the one-off
 * migration that rewrites documents seeded before chapters became numeric.
 */
export function chapterNumberFromName(classLevel: string, subject: string, name: string): ChapterNumber | null {
  const map = CHAPTER_NAMES[key(classLevel, subject)]
  if (!map) return null
  const needle = name.trim().toLowerCase()
  for (const [num, label] of Object.entries(map)) {
    if (label.toLowerCase() === needle) return num
  }
  return null
}