// ZeeShaoor.pk — LQ Paper Generator (Long Question / Subjective Engine)
//
// SIMPLE EXPLANATION (for anyone reading this later):
// Long Questions (LQs) can come in two shapes:
//   1) SOLO   — one standalone question, worth 5 marks.
//   2) PAIRED — a Theory question + a Numerical question bundled together
//               as one "Q.5(a) OR Q.5(b)" style choice, worth 9 marks total
//               (4 for theory + 5 for numerical). This is how real BISE
//               board papers are structured.
// Which shape gets used depends on `enforcePairing` — true = board pattern
// (paired), false = everything else (solo).

export type LqMode = 'bise_pattern' | 'custom_builder' | 'flexible_choice' | 'compulsory'

export interface LqSectionDef {
  label: string
  given: number
  attempt: number
  enforcePairing?: boolean
}

export interface LqQuestion {
  _id: string
  questionText: string
  correctAnswer: string
  chapter: string
  topicId?: string
  difficulty: string
  sloTag: string
  questionCategory: string   // 'Long_Theory' | 'Long_Numerical'
  marks: number
}

export interface LqPreset {
  id: string
  mode: LqMode
  label: string
  desc?: string
  given: number
  attempt: number
  enforcePairing: boolean
  sections?: LqSectionDef[]
}

export interface LqBalanceTargets {
  difficulty: { easy: number; medium: number; hard: number }
  slo: { knowledge: number; comprehension: number; application: number }
}

export interface LqGenerationConfig {
  mode: string
  given: number
  attempt: number
  enforcePairing: boolean
  sections: LqSectionDef[]
  balance: LqBalanceTargets
}

/** One paired Long Question — student picks EITHER `a` OR `b`. */
export interface LqPair {
  a: LqQuestion   // Theory side
  b: LqQuestion   // Numerical side
  marks: number   // combined marks for this pair (a.marks + b.marks)
}

export interface LqSectionResult {
  label: string
  given: number
  attempt: number
  enforcePairing: boolean
  solos: LqQuestion[]     // filled when enforcePairing = false
  pairings: LqPair[]      // filled when enforcePairing = true
}

export interface LqGenerationResult {
  sections: LqSectionResult[]
  totalMarks: number
  totalQuestions: number   // counts a pair as 1 "question slot" (matches how it's printed on paper)
  stats: {
    difficulty: Record<string, number>
    slo: Record<string, number>
  }
}

export const LQ_MODE_LABELS: Record<LqMode, string> = {
  bise_pattern: 'BISE Pattern',
  custom_builder: 'Custom Builder',
  flexible_choice: 'Flexible Choice',
  compulsory: 'Compulsory',
}

export const LQ_MODE_ORDER: LqMode[] = [
  'bise_pattern',
  'custom_builder',
  'flexible_choice',
  'compulsory',
]

export const LQ_PRESETS: LqPreset[] = [
  { id: 'lq_bise_full',    mode: 'bise_pattern',    label: 'Full BISE',       desc: '3 given · attempt 2 (with pairing)',  given: 3, attempt: 2, enforcePairing: true },
  { id: 'lq_bise_half',    mode: 'bise_pattern',    label: 'Half BISE',       desc: '2 given · attempt 1 (with pairing)',  given: 2, attempt: 1, enforcePairing: true },
  { id: 'lq_flex_two',     mode: 'flexible_choice', label: 'Flexible 2',      desc: '3 given · attempt 2',                 given: 3, attempt: 2, enforcePairing: false },
  { id: 'lq_flex_three',   mode: 'flexible_choice', label: 'Flexible 3',      desc: '4 given · attempt 3',                 given: 4, attempt: 3, enforcePairing: false },
  { id: 'lq_comp_one',     mode: 'compulsory',      label: 'Compulsory 1',    desc: '1 compulsory',                        given: 1, attempt: 1, enforcePairing: false },
  { id: 'lq_comp_two',     mode: 'compulsory',      label: 'Compulsory 2',    desc: '2 compulsory',                        given: 2, attempt: 2, enforcePairing: false },
  { id: 'lq_comp_three',   mode: 'compulsory',      label: 'Compulsory 3',    desc: '3 compulsory',                        given: 3, attempt: 3, enforcePairing: false },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Marks for one "attempt slot": 9 if paired (4+5), 5 if solo. */
export function lqTotalMarks(given: number, attempt: number, enforcePairing: boolean): number {
  return attempt * (enforcePairing ? 9 : 5)
}

/** Rough minutes needed: paired questions take longer (~15 min) than solo (~10 min). */
export function lqEstTime(given: number, attempt: number, enforcePairing: boolean): number {
  return attempt * (enforcePairing ? 15 : 10)
}

export function lqTotalFromSections(sections: { label: string; given: number; attempt: number; enforcePairing: boolean }[]): { totalAttempt: number; totalMarks: number } {
  let totalAttempt = 0
  let totalMarks = 0
  for (const s of sections) {
    totalAttempt += s.attempt
    totalMarks += lqTotalMarks(s.given, s.attempt, s.enforcePairing)
  }
  return { totalAttempt, totalMarks }
}

/**
 * Build the SOLO version of one section: pick `given` random questions from
 * the combined pool, keep the first `attempt` of them as the final picks.
 */
function buildSoloSection(
  label: string,
  given: number,
  attempt: number,
  pool: LqQuestion[],
  used: Set<string>,
): LqSectionResult {
  const available = pool.filter(q => !used.has(q._id))
  const count = Math.min(given, available.length)
  const chosen = shuffle(available).slice(0, count)
  chosen.forEach(q => used.add(q._id))

  const solos = chosen.slice(0, attempt)
  return { label, given: chosen.length, attempt, enforcePairing: false, solos, pairings: [] }
}

/**
 * Build the PAIRED version of one section (board pattern): make up to
 * `given` Theory+Numerical pairs, then keep `attempt` of those pairs.
 * If one pool runs out of questions before the other, we stop pairing —
 * a pair needs BOTH sides, so a leftover unpaired question is dropped.
 */
function buildPairedSection(
  label: string,
  given: number,
  attempt: number,
  theoryPool: LqQuestion[],
  numericalPool: LqQuestion[],
  usedTheory: Set<string>,
  usedNumerical: Set<string>,
): LqSectionResult {
  const theoryAvailable = shuffle(theoryPool.filter(q => !usedTheory.has(q._id)))
  const numericalAvailable = shuffle(numericalPool.filter(q => !usedNumerical.has(q._id)))

  const pairCount = Math.min(given, theoryAvailable.length, numericalAvailable.length)
  const allPairs: LqPair[] = []
  for (let i = 0; i < pairCount; i++) {
    const a = theoryAvailable[i]
    const b = numericalAvailable[i]
    usedTheory.add(a._id)
    usedNumerical.add(b._id)
    allPairs.push({ a, b, marks: a.marks + b.marks })
  }

  const pairings = shuffle(allPairs).slice(0, attempt)
  return { label, given: allPairs.length, attempt, enforcePairing: true, solos: [], pairings }
}

export function generateLQPaper(
  config: LqGenerationConfig,
  theoryPool: LqQuestion[],
  numericalPool: LqQuestion[],
): LqGenerationResult {
  const combinedPool = shuffle([...theoryPool, ...numericalPool])
  const used = new Set<string>()
  const usedTheory = new Set<string>()
  const usedNumerical = new Set<string>()

  const sectionDefs: LqSectionDef[] = config.sections && config.sections.length > 0
    ? config.sections
    : [{ label: 'LQ', given: config.given, attempt: config.attempt, enforcePairing: config.enforcePairing }]

  const sections: LqSectionResult[] = sectionDefs.map(sec => {
    const pairIt = sec.enforcePairing ?? config.enforcePairing
    return pairIt
      ? buildPairedSection(sec.label, sec.given, sec.attempt, theoryPool, numericalPool, usedTheory, usedNumerical)
      : buildSoloSection(sec.label, sec.given, sec.attempt, combinedPool, used)
  })

  // Each pair or each solo counts as one "question" on the paper.
  const totalQuestions = sections.reduce((sum, s) => sum + s.solos.length + s.pairings.length, 0)
  const totalMarks = sections.reduce((sum, s) => sum + lqTotalMarks(s.given, s.attempt, s.enforcePairing), 0)

  // Stats: count every question that actually appears on the paper — for a
  // pair, that's both the theory and numerical side.
  const stats = {
    difficulty: { easy: 0, medium: 0, hard: 0 } as Record<string, number>,
    slo: { knowledge: 0, comprehension: 0, application: 0 } as Record<string, number>,
  }
  const tally = (q: LqQuestion) => {
    const d = q.difficulty?.toLowerCase() || 'medium'
    stats.difficulty[d] = (stats.difficulty[d] || 0) + 1
    const s = q.sloTag?.toLowerCase() || 'comprehension'
    stats.slo[s] = (stats.slo[s] || 0) + 1
  }
  for (const sec of sections) {
    sec.solos.forEach(tally)
    sec.pairings.forEach(p => { tally(p.a); tally(p.b) })
  }

  return { sections, totalMarks, totalQuestions, stats }
}