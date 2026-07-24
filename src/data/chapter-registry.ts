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
// database is the chapter NUMBER as a string ("1".."12") — unambiguous, stable
// under renaming and translation, and derivable straight from a filename.
// Prose names live here, for display only, and are never used to match.
//
// Adding a subject: add a `<classLevel>:<Subject>` key. A subject with no entry
// still works — chapters fall back to "Chapter N".

export type ChapterNumber = string

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
 * "chapter_4_turning_effects...", "class_9_physics_ch1_mcqs.csv"), whereas the
 * topic column mixes numbered headings with free prose like "Exercise MCQs".
 *
 * Note the `ch(?:apter)?` alternation cannot match the "cl" of "class_9", so a
 * class number is never mistaken for a chapter number.
 */
export function chapterFromFilename(filename: string): ChapterNumber | null {
  const m = filename.match(/ch(?:apter)?[_\-\s]?(\d{1,2})/i)
  return m ? String(Number(m[1])) : null
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
