// ZeeShaoor.pk — Short Question Generation Engine
// Every SQ = 2 marks (BISE Punjab standard)

export type SloTag = 'Knowledge' | 'Comprehension' | 'Application';
export type SqSubType = 'Theory' | 'Numerical_Reasoning';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface SqQuestion {
  _id: string;
  questionText: string;
  correctAnswer: string;
  chapter: string;
  topicId?: string;
  difficulty: Difficulty;
  sloTag: SloTag;
  subType: SqSubType;
  marks: number;
}

export interface SqSectionDef {
  label: string;
  given: number;
  attempt: number;
}

export type SqMode = 'flexible_choice' | 'compulsory' | 'bise_pattern' | 'custom_builder';

export interface SqPreset {
  id: string;
  mode: SqMode;
  label: string;
  desc: string;
  sections: SqSectionDef[];
}

export const SQ_MODE_LABELS: Record<SqMode, string> = {
  flexible_choice: 'Flexible Choice',
  compulsory: 'Compulsory',
  bise_pattern: 'BISE Pattern',
  custom_builder: 'Custom Builder',
};

export const SQ_MODE_ORDER: SqMode[] = [
  'flexible_choice',
  'bise_pattern',
  'compulsory',
  'custom_builder',
];

export const SQ_PRESETS: SqPreset[] = [
  { id: 'flex_choice_topical_quiz',  mode: 'flexible_choice', label: 'Topical Quiz',     desc: '12 given · attempt 10',   sections: [{ label: 'All', given: 12, attempt: 10 }] },
  { id: 'flex_choice_monthly_review', mode: 'flexible_choice', label: 'Monthly Review',  desc: '20 given · attempt 15',   sections: [{ label: 'All', given: 20, attempt: 15 }] },
  { id: 'flex_choice_quick_quiz',     mode: 'flexible_choice', label: 'Quick Quiz',      desc: '5 given · attempt 3',     sections: [{ label: 'All', given: 5, attempt: 3 }] },
  { id: 'bise_full_board',  mode: 'bise_pattern', label: 'Full Board',  desc: '3 sections × 8→5', sections: [{ label: 'Q.2', given: 8, attempt: 5 }, { label: 'Q.3', given: 8, attempt: 5 }, { label: 'Q.4', given: 8, attempt: 5 }] },
  { id: 'bise_half_board',  mode: 'bise_pattern', label: 'Half Board',  desc: '1 section · 8→5',   sections: [{ label: 'Q.2', given: 8, attempt: 5 }] },
  { id: 'bise_double_board',mode: 'bise_pattern', label: 'Double Board',desc: '2 sections × 8→5', sections: [{ label: 'Q.2', given: 8, attempt: 5 }, { label: 'Q.3', given: 8, attempt: 5 }] },
  { id: 'comp_mini_quiz',      mode: 'compulsory', label: 'Mini Quiz',      desc: '5 Qs · all compulsory',    sections: [{ label: 'All', given: 5, attempt: 5 }] },
  { id: 'comp_chapter_test',   mode: 'compulsory', label: 'Chapter Test',   desc: '10 Qs · all compulsory',   sections: [{ label: 'All', given: 10, attempt: 10 }] },
  { id: 'comp_half_book',      mode: 'compulsory', label: 'Half Book',      desc: '15 Qs · all compulsory',   sections: [{ label: 'All', given: 15, attempt: 15 }] },
  { id: 'comp_full_book',      mode: 'compulsory', label: 'Full Book',      desc: '20 Qs · all compulsory',   sections: [{ label: 'All', given: 20, attempt: 20 }] },
];

export interface SqBalanceTargets {
  difficulty: { easy: number; medium: number; hard: number };
  slo: { knowledge: number; comprehension: number; application: number };
  subType: { theory: number; numerical: number };
}

export const DEFAULT_BALANCE: SqBalanceTargets = {
  difficulty: { easy: 0.3, medium: 0.4, hard: 0.3 },
  slo: { knowledge: 0.35, comprehension: 0.4, application: 0.25 },
  subType: { theory: 0.7, numerical: 0.3 },
};

export interface SqGenerationConfig {
  mode: SqMode;
  sections: SqSectionDef[];
  balance: SqBalanceTargets;
  chapterWeights?: Record<string, number>;
}

export interface SqSectionResult {
  label: string;
  given: number;
  attempt: number;
  questions: SqQuestion[];
}

export interface SqGenerationResult {
  sections: SqSectionResult[];
  totalMarks: number;
  totalQuestions: number;
  stats: {
    difficulty: Record<Difficulty, number>;
    slo: Record<SloTag, number>;
    subType: Record<SqSubType, number>;
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function computeFitScore(
  q: SqQuestion,
  selected: SqQuestion[],
  total: number,
  targets: SqBalanceTargets
): number {
  const n = selected.length;
  if (n === 0) return 0.5 + Math.random() * 0.5;
  const remaining = total - n;
  if (remaining <= 0) return -1;

  const currentDiff = { easy: 0, medium: 0, hard: 0 };
  const currentSlo = { knowledge: 0, comprehension: 0, application: 0 };
  const currentSub = { theory: 0, numerical: 0 };

  for (const s of selected) {
    currentDiff[s.difficulty.toLowerCase() as keyof typeof currentDiff]++;
    currentSlo[s.sloTag.toLowerCase() as keyof typeof currentSlo]++;
    currentSub[s.subType === 'Theory' ? 'theory' : 'numerical']++;
  }

  const targetDiff = (targets.difficulty[q.difficulty.toLowerCase() as keyof typeof targets.difficulty] ?? 0.25) * total;
  const targetSlo = (targets.slo[q.sloTag.toLowerCase() as keyof typeof targets.slo] ?? 0.33) * total;
  const targetSub = (targets.subType[q.subType === 'Theory' ? 'theory' : 'numerical'] ?? 0.5) * total;

  const defDiff = currentDiff[q.difficulty.toLowerCase() as keyof typeof currentDiff] - targetDiff;
  const defSlo = currentSlo[q.sloTag.toLowerCase() as keyof typeof currentSlo] - targetSlo;
  const defSub = currentSub[q.subType === 'Theory' ? 'theory' : 'numerical'] - targetSub;

  const score = -(defDiff * 1.0 + defSlo * 0.8 + defSub * 0.6);
  const noise = Math.random() * 0.2;

  return score + noise;
}

export function generateSQPaper(
  config: SqGenerationConfig,
  pool: SqQuestion[]
): SqGenerationResult {
  const { sections, balance } = config;
  const used = new Set<string>();
  const result: SqSectionResult[] = [];
  let totalQuestions = 0;

  for (const sec of sections) {
    const available = pool.filter(q => !used.has(q._id));
    const shuffled = shuffle(available);
    const selected: SqQuestion[] = [];

    const sectionGiven = Math.min(sec.given, shuffled.length);
    const staged: SqQuestion[] = [];

    for (let i = 0; i < sectionGiven; i++) {
      const candidates = shuffled.filter(q => !used.has(q._id) && !staged.includes(q));
      if (candidates.length === 0) break;
      let best = candidates[0];
      let bestScore = -Infinity;
      for (const c of candidates) {
        const score = computeFitScore(c, selected, sec.attempt, balance);
        if (score > bestScore) {
          bestScore = score;
          best = c;
        }
      }
      staged.push(best);
    }

    const finalCount = Math.min(sec.attempt, staged.length);
    const attempts = shuffle(staged).slice(0, finalCount);
    for (const q of staged) used.add(q._id);
    selected.push(...attempts);

    totalQuestions += sec.attempt;
    result.push({
      label: sec.label,
      given: staged.length,
      attempt: sec.attempt,
      questions: selected,
    });
  }

  const allSelected = result.flatMap(r => r.questions);
  const stats: {
    difficulty: Record<Difficulty, number>;
    slo: Record<SloTag, number>;
    subType: Record<SqSubType, number>;
  } = {
    difficulty: { Easy: 0, Medium: 0, Hard: 0 },
    slo: { Knowledge: 0, Comprehension: 0, Application: 0 },
    subType: { Theory: 0, Numerical_Reasoning: 0 },
  };
  for (const q of allSelected) {
    stats.difficulty[q.difficulty]++;
    stats.slo[q.sloTag]++;
    stats.subType[q.subType]++;
  }

  return {
    sections: result,
    totalMarks: totalQuestions * 2,
    totalQuestions,
    stats,
  };
}

export function sqTotalMarks(sections: SqSectionDef[]): number {
  return sections.reduce((s, sec) => s + sec.attempt, 0) * 2;
}

export function sqTotalAttempts(sections: SqSectionDef[]): number {
  return sections.reduce((s, sec) => s + sec.attempt, 0);
}

export function sqTotalGiven(sections: SqSectionDef[]): number {
  return sections.reduce((s, sec) => s + sec.given, 0);
}
