/**
 * Curriculum scope — the single source of truth for which class/subject
 * combinations are currently available in the paper generator.
 *
 * Only classes and subjects with seeded question data belong here.
 */

export const CURRICULUM = {
  'Class 9': ['Physics'],
  'Class 10': ['Computer'],
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
