// Shared types for the Paper Generator.

/** Which question-type configurator is currently active. */
export type Phase = "mcq" | "sq" | "lq" | "hybrid" | "board" | "custom";

/** Aggregate totals shown in the bottom dock. */
export interface LiveConfig {
  mcq: number;
  sq: number;
  lq: number;
  totalMarks: number;
  estTime: number;
  selectionLabel: string;
}

export type HybridGroup = "quick_strict" | "chapter_monthly" | "grand_halfbook" | "ultimate_bise";

export interface HybridPreset {
  id: string; group: HybridGroup; label: string; desc: string; tag: string;
  marks: number; time: number; mcq: number;
  sq: { given: number; attempt: number }[];
  lq: { given: number; attempt: number; pairing: boolean }[];
}

export interface BoardPreset {
  id: string; label: string; template: "punjab" | "federal";
  totalMarks: number; mcq: number;
  sqSections: { given: number; attempt: number }[];
  sqMarksPerQ: number; lqGiven: number; lqAttempt: number; lqMarksPerQ: number;
  desc?: string;
}
