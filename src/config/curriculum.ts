/**
 * Curriculum scope — the single source of truth for which class/subject
 * combinations are currently available in the paper generator.
 *
 * Only classes and subjects with seeded question data belong here.
 * Subject spelling MUST match CLASS_SUBJECT_MATRIX in src/models/Question.ts
 * exactly (e.g. "Mathematics" not "Maths", "Islamiyat (Compulsory)" not
 * "Islamiat") — these are matched with strict equality against the database.
 *
 * English and Urdu are deliberately left out for now: their source CSVs are
 * organised by topic (grammar, comprehension, letter-writing) rather than by
 * numbered textbook chapters, so they need a different chapter-selection
 * model before they can be added here safely.
 */

export const CURRICULUM = {
  'Class 9': [
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
    'Computer',
    'Islamiyat (Compulsory)',
  ],
  'Class 10': [
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
    'Computer',
    'Islamiyat (Compulsory)',
  ],
} as const satisfies Record<string, readonly string[]>;

export type ClassName = keyof typeof CURRICULUM;
export type SubjectName = (typeof CURRICULUM)[ClassName][number];

/** Ordered list of selectable classes. */
export const CLASSES = Object.keys(CURRICULUM) as ClassName[];

/** Subjects available for a given class (empty when the class is unknown). */
export function getSubjects(className: string): readonly string[] {
  return CURRICULUM[className as ClassName] ?? [];
}

/** Whether a class/subject pair is a valid, seeded combination. */
export function isValidSelection(className: string, subject: string): boolean {
  return getSubjects(className).includes(subject);
}