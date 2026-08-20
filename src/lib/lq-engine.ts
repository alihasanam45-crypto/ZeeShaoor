// ZeeShaoor.pk — LQ Paper Generator (Long Question / Subjective Engine)

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
  questionCategory: string
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

export interface LqSectionResult {
  label: string
  given: number
  attempt: number
  solos: LqQuestion[]
  pairings?: { a: LqQuestion; b: LqQuestion }[]
}

export interface LqGenerationResult {
  sections: LqSectionResult[]
  totalMarks: number
  totalQuestions: number
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

export function lqTotalMarks(given: number, attempt: number, enforcePairing: boolean): number {
  if (enforcePairing) return attempt * 9
  return attempt * 5
}

export function lqEstTime(given: number, attempt: number, enforcePairing: boolean): number {
  if (enforcePairing) return attempt * 15
  return attempt * 10
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

export function generateLQPaper(
  config: LqGenerationConfig,
  theoryPool: LqQuestion[],
  numericalPool: LqQuestion[],
): LqGenerationResult {
  const allPool = shuffle([...theoryPool, ...numericalPool])
  const used = new Set<string>()
  const sections: LqSectionResult[] = []
  let totalQuestions = 0

  if (config.sections && config.sections.length > 0) {
    for (const sec of config.sections) {
      const available = allPool.filter(q => !used.has(q._id))
      const count = Math.min(sec.given, available.length)
      const chosen = shuffle(available).slice(0, count)
      chosen.forEach(q => used.add(q._id))

      const solos = chosen.slice(0, sec.attempt)
      totalQuestions += solos.length
      sections.push({ label: sec.label, given: chosen.length, attempt: sec.attempt, solos })
    }
  } else {
    const available = allPool.filter(q => !used.has(q._id))
    const count = Math.min(config.given, available.length)
    const chosen = shuffle(available).slice(0, count)
    chosen.forEach(q => used.add(q._id))

    const solos = chosen.slice(0, config.attempt)
    totalQuestions += solos.length
    sections.push({ label: 'LQ', given: chosen.length, attempt: config.attempt, solos })
  }

  const allSelected = sections.flatMap(s => s.solos)
  const stats = {
    difficulty: { easy: 0, medium: 0, hard: 0 } as Record<string, number>,
    slo: { knowledge: 0, comprehension: 0, application: 0 } as Record<string, number>,
  }
  for (const q of allSelected) {
    const d = q.difficulty?.toLowerCase() || 'medium'
    stats.difficulty[d] = (stats.difficulty[d] || 0) + 1
    const s = q.sloTag?.toLowerCase() || 'comprehension'
    stats.slo[s] = (stats.slo[s] || 0) + 1
  }

  return {
    sections,
    totalMarks: totalQuestions * 5,
    totalQuestions,
    stats,
  }
}
