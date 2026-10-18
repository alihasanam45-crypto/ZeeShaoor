// Static configuration data for the Paper Generator.
// Values are copied verbatim from the original page module — no rule changes.

import type { BoardPreset, HybridGroup, HybridPreset } from "./types";

// Subject names MUST match CLASS_SUBJECT_MATRIX in src/models/Question.ts
// exactly — they are the literal values stored in the `subject` field and are
// matched with strict equality.
export const CLASS_SUBJECTS: Record<string, string[]> = {
  "Class 5": ["Mathematics","English","Urdu","Science","Islamiyat","Social Studies"],
  "Class 6": ["Mathematics","English","Urdu","Science","Islamiyat","Computer"],
  "Class 7": ["Mathematics","English","Urdu","Science","Islamiyat","Computer"],
  "Class 8": ["Mathematics","English","Urdu","Science","Islamiyat","Computer"],
  "Class 9": ["Physics","Chemistry","Biology","Mathematics","English","Urdu","Islamiyat (Compulsory)","Computer"],
  "Class 10": ["Physics","Chemistry","Biology","Mathematics","English","Urdu","Islamiyat (Compulsory)","Computer"],
  "Class 11": ["Physics","Chemistry","Biology","Mathematics","English","Urdu","Islamiyat (Compulsory)","Computer","Economics"],
  "Class 12": ["Physics","Chemistry","Biology","Mathematics","English","Urdu","Islamiyat (Compulsory)","Computer","Economics"],
};

export const CLASSES = Object.keys(CLASS_SUBJECTS);

export const SUBJECT_ICONS: Record<string, string> = {
  Physics:"⚛️", Chemistry:"🧪", Biology:"🧬", Mathematics:"∑",
  English:"A", Urdu:"ا", "Islamiyat (Compulsory)":"☪", Islamiyat:"☪", Computer:"💻",
  Science:"🔭", "Social Studies":"🌍", Economics:"₨",
};

// Seed balance sent to the generator API as sqConfig.balance.
export const SQ_BALANCE_SEED = {
  easy:30, medium:40, hard:30,
  knowledge:35, comprehension:40, application:25,
  theory:70, numerical:30,
};

export const HYBRID_GROUPS: { id: HybridGroup; label: string }[] = [
  { id:'quick_strict', label:'Quick / Strict' },
  { id:'chapter_monthly', label:'Chapter / Monthly' },
  { id:'grand_halfbook', label:'Grand / Half-Book' },
  { id:'ultimate_bise', label:'Ultimate BISE' },
];

export const HYBRID_PRESETS: HybridPreset[] = [
  { id:'h_mini20', group:'quick_strict', label:'Mini 20M', desc:'5 MCQ + 3 SQ + 1 LQ (a+b)', tag:'No choice',
    marks:20, time:25, mcq:5, sq:[{given:3,attempt:3}], lq:[{given:1,attempt:1,pairing:true}] },
  { id:'h_concept25', group:'quick_strict', label:'Concept 25M', desc:'6 MCQ + 5 SQ + 1 LQ (a+b)', tag:'No choice',
    marks:25, time:30, mcq:6, sq:[{given:5,attempt:5}], lq:[{given:1,attempt:1,pairing:true}] },
  { id:'h_daily30', group:'quick_strict', label:'Daily 30M', desc:'7 MCQ + 7 SQ + 1 LQ (a+b)', tag:'No choice',
    marks:30, time:35, mcq:7, sq:[{given:7,attempt:7}], lq:[{given:1,attempt:1,pairing:true}] },
  { id:'h_weekly35', group:'quick_strict', label:'Weekly 35M', desc:'10 MCQ + 8 SQ + 1 LQ (a+b)', tag:'No choice',
    marks:35, time:40, mcq:10, sq:[{given:8,attempt:8}], lq:[{given:1,attempt:1,pairing:true}] },
  { id:'h_chapter30', group:'chapter_monthly', label:'Chapter Std 30M', desc:'11 MCQ · SQ 8->5 · 1 LQ (a+b)', tag:'With choice',
    marks:30, time:40, mcq:11, sq:[{given:8,attempt:5}], lq:[{given:2,attempt:1,pairing:true}] },
  { id:'h_smart35', group:'chapter_monthly', label:'Smart Monthly 35M', desc:'10 MCQ · SQ 10->8 · 1 LQ (a+b)', tag:'With choice',
    marks:35, time:45, mcq:10, sq:[{given:10,attempt:8}], lq:[{given:2,attempt:1,pairing:true}] },
  { id:'h_term40', group:'chapter_monthly', label:'Term Intro 40M', desc:'15 MCQ · SQ 12->8 · 1 LQ (a+b)', tag:'With choice',
    marks:40, time:50, mcq:15, sq:[{given:12,attempt:8}], lq:[{given:2,attempt:1,pairing:true}] },
  { id:'h_quarter45', group:'chapter_monthly', label:'Quarter Book 45M', desc:'15 MCQ · SQ 10->6 · 2 LQ composites', tag:'With choice',
    marks:45, time:60, mcq:15, sq:[{given:10,attempt:6}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_half40', group:'grand_halfbook', label:'Half Board 40M', desc:'10 MCQ · SQ 8->6 · 2 LQ composites', tag:'Board replica',
    marks:40, time:55, mcq:10, sq:[{given:8,attempt:6}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_grand50', group:'grand_halfbook', label:'Grand Test 50M', desc:'12 MCQ · 2 SQ sec 7->5 each · 2 LQ composites', tag:'Board replica',
    marks:50, time:70, mcq:12, sq:[{given:7,attempt:5},{given:7,attempt:5}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_preboard60', group:'grand_halfbook', label:'Pre-Board 60M', desc:'12 MCQ · 2 SQ sec (10->7 & 10->8) · 2 LQ composites', tag:'Board replica',
    marks:60, time:80, mcq:12, sq:[{given:10,attempt:7},{given:10,attempt:8}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_full60', group:'ultimate_bise', label:'BISE FULL BOARD 60M', desc:'12 MCQ · 3 SQ sec 8->5 · 2 LQ composites', tag:'★ Crown Jewel',
    marks:60, time:85, mcq:12, sq:[{given:8,attempt:5},{given:8,attempt:5},{given:8,attempt:5}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_strict60', group:'ultimate_bise', label:'Board Strict 60M', desc:'12 MCQ · SQ 15->15 · 2 LQ (no choice)', tag:'No choice',
    marks:60, time:80, mcq:12, sq:[{given:15,attempt:15}], lq:[{given:2,attempt:2,pairing:true}] },
  { id:'h_concept50', group:'ultimate_bise', label:'Board Concept 50M', desc:'14 MCQ · SQ 12->9 · 2 LQ composites', tag:'Concept focus',
    marks:50, time:65, mcq:14, sq:[{given:12,attempt:9}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_elite60', group:'ultimate_bise', label:'Elite Custom 60M', desc:'10 MCQ · 2 SQ sec 10->8 each · 2 LQ composites', tag:'Elite',
    marks:60, time:85, mcq:10, sq:[{given:10,attempt:8},{given:10,attempt:8}], lq:[{given:3,attempt:2,pairing:true}] },
];

const PUNJAB_BOARD_BASE: Omit<BoardPreset, 'id' | 'label'> = {
  template:'punjab', totalMarks:60, mcq:12,
  sqSections:[{given:8,attempt:5},{given:8,attempt:5},{given:8,attempt:5}],
  sqMarksPerQ:2, lqGiven:3, lqAttempt:2, lqMarksPerQ:9,
};

const PUNJAB_BOARDS: { id: string; label: string }[] = [
  { id:'bp_lhr', label:'BISE Lahore' },
  { id:'bp_guj', label:'BISE Gujranwala' },
  { id:'bp_fsd', label:'BISE Faisalabad' },
  { id:'bp_mtn', label:'BISE Multan' },
  { id:'bp_sgd', label:'BISE Sargodha' },
  { id:'bp_rwp', label:'BISE Rawalpindi' },
  { id:'bp_dgk', label:'BISE D.G.Khan' },
  { id:'bp_swl', label:'BISE Sahiwal' },
];

const FEDERAL_BOARD: BoardPreset = {
  id:'bp_fbise', label:'FBISE Federal', template:'federal', totalMarks:65,
  mcq:12, sqSections:[{given:15,attempt:11}], sqMarksPerQ:3,
  lqGiven:3, lqAttempt:2, lqMarksPerQ:10,
  desc:'SLO-Based (Sec A·B·C)',
};

/**
 * The board list is static, so it is built once at module load instead of on
 * every call — the previous getBoardPresets() allocated a fresh array each of
 * the eight places it was called, on every render. Same contents, same order.
 */
export const BOARD_PRESETS: BoardPreset[] = [
  ...PUNJAB_BOARDS.map(b => ({ ...b, ...PUNJAB_BOARD_BASE })),
  FEDERAL_BOARD,
];
