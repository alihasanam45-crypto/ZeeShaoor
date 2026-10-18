import type { LucideIcon } from 'lucide-react'
import {
  BookOpenCheck, ClipboardCheck, FileText, GraduationCap, Languages,
  Layers, Lock, Printer, Rocket, ShieldCheck, Target, UserCog, WandSparkles,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  BRAND — official spelling. The P in .Pk is always capital.         */
/* ------------------------------------------------------------------ */
export const BRAND = {
  name: 'ZeeShaoor',
  tld: '.Pk',
  full: 'ZeeShaoor.Pk',
  tagline: 'Awakening intellect, anchoring truth',
} as const

/* ------------------------------------------------------------------ */
/*  CONTACT — one source, used by nav, contact block, footer, ticker   */
/* ------------------------------------------------------------------ */
export const CONTACT = {
  email: 'zeeshaoorofficial@gmail.com',
  phoneDisplay: '0316 0404585',
  phoneTel: '+923160404585',
  whatsappNumber: '923160404585',
  hours: 'Mon–Sat · 9am–9pm',
} as const

export const WHATSAPP_URL =
  `https://wa.me/${CONTACT.whatsappNumber}` +
  `?text=${encodeURIComponent('Assalam-o-Alaikum, I would like to know more about ZeeShaoor.Pk')}`

/* ------------------------------------------------------------------ */
/*  LEGAL — flip to true ONLY after confirming the route renders.      */
/*  ⚠ VERIFY: does src/app/privacy/page.tsx exist? terms/page.tsx?     */
/*  Left false so the footer never ships a dead link.                  */
/* ------------------------------------------------------------------ */
export const LEGAL = { privacy: false, terms: false } as const

/* ------------------------------------------------------------------ */
/*  CURRICULUM — SINGLE SOURCE OF TRUTH                                */
/*                                                                     */
/*  ⚠ VERIFY: replace the literal below with your real registry, e.g.  */
/*    import { CURRICULUM_REGISTRY } from '@/config/curriculum'        */
/*    export const CURRICULUM = CURRICULUM_REGISTRY                    */
/*      .filter(e => e.status === 'live')                              */
/*      .map(toLandingEntry)                                           */
/*                                                                     */
/*  Keep the SubjectEntry shape and nothing else on this page breaks.  */
/* ------------------------------------------------------------------ */
export interface PreviewQuestion {
  objective: string
  optionCount: number
  correctIndex: number
  short: string
  long: string
  urdu?: string
}

export interface SubjectEntry {
  id: string
  grade: string          // 'Class 9'
  gradeShort: string     // '9'
  subject: string        // 'Physics'
  chapterFrom: number
  chapterTo: number
  note?: string
  preview: PreviewQuestion
}

export const CURRICULUM: SubjectEntry[] = [
  {
    id: 'c9-physics',
    grade: 'Class 9',
    gradeShort: '9',
    subject: 'Physics',
    chapterFrom: 1,
    chapterTo: 9,
    preview: {
      objective: 'The SI unit of electric charge is',
      optionCount: 4,
      correctIndex: 1,
      short: 'Define the moment of a force and state its unit.',
      long: 'State the law of conservation of momentum and derive it for two colliding bodies.',
      urdu: 'عدسے کی قوّت سے کیا مراد ہے؟ مثال دے کر واضح کریں۔',
    },
  },
  {
    id: 'c10-computer',
    grade: 'Class 10',
    gradeShort: '10',
    subject: 'Computer',
    chapterFrom: 1,
    chapterTo: 8,
    preview: {
      objective: 'A loop that executes at least once is',
      optionCount: 4,
      correctIndex: 2,
      short: 'Differentiate between a compiler and an interpreter.',
      long: 'Explain the structure of a C program with a suitable example.',
    },
  },
  {
    id: 'c10-biology',
    grade: 'Class 10',
    gradeShort: '10',
    subject: 'Biology',
    chapterFrom: 1,
    chapterTo: 10,
    preview: {
      objective: 'The functional unit of the kidney is the',
      optionCount: 4,
      correctIndex: 0,
      short: 'Define homeostasis and name two organs involved in it.',
      long: 'Describe the structure of the human eye with a labelled diagram.',
    },
  },
  {
    id: 'c10-chemistry',
    grade: 'Class 10',
    gradeShort: '10',
    subject: 'Chemistry',
    chapterFrom: 14,
    chapterTo: 26,
    note: 'Chapter numbering continues from the previous class/book sequence.',
    preview: {
      objective: 'The pH of a neutral solution at 25 °C is',
      optionCount: 4,
      correctIndex: 1,
      short: 'Define an exothermic reaction and give one example.',
      long: 'Explain the preparation and uses of ethanoic acid.',
    },
  },
]

/** Derived — never hand-maintained. */
export const AVAILABLE_CLASSES = Array.from(
  new Map(CURRICULUM.map((c) => [c.grade, { grade: c.grade, gradeShort: c.gradeShort }])).values(),
)

export const subjectsForGrade = (grade: string) =>
  CURRICULUM.filter((c) => c.grade === grade)

export const countSubjects = (grade: string) => subjectsForGrade(grade).length

/* ------------------------------------------------------------------ */
/*  ANNOUNCEMENT BAR — verified facts only. No trial, price or stat.   */
/* ------------------------------------------------------------------ */
export const ANNOUNCEMENTS: string[] = [
  BRAND.tagline,
  `Welcome to ${BRAND.full}`,
  ...CURRICULUM.map(
    (c) => `${c.grade} ${c.subject} — Chapters ${c.chapterFrom}–${c.chapterTo} available`,
  ),
  'Create curriculum-aligned papers in minutes',
  'Urdu and English academic workspace',
  `Email: ${CONTACT.email}`,
  `Contact: ${CONTACT.phoneDisplay}`,
  'Latest board news from official sources',
]

/* ------------------------------------------------------------------ */
/*  NAVIGATION                                                         */
/* ------------------------------------------------------------------ */
export const NAV_LINKS = [
  { id: 'how', label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'classes', label: 'Classes' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'contact', label: 'Contact' },
] as const

export const ROUTES = {
  login: '/login',
  register: '/register',
  teacher: '/teacher',
  student: '/student/dashboard',
  samplePaper: '#preview', // ⚠ swap to a real public route/PDF if one exists
} as const

/* ------------------------------------------------------------------ */
/*  PORTALS — Admin deliberately absent from public data entirely.     */
/* ------------------------------------------------------------------ */
export interface Portal {
  title: string
  tagline: string
  href: string
  icon: LucideIcon
}

export const PORTALS: Portal[] = [
  {
    title: 'Teacher Portal',
    tagline: 'Select the class, subject and chapters, then build and review the paper before it is printed.',
    href: ROUTES.teacher,
    icon: GraduationCap,
  },
  {
    title: 'Student Portal',
    tagline: 'Open the work assigned to you, practise the chapters that are available, and track what you have completed.',
    href: ROUTES.student,
    icon: Rocket,
  },
]

/* ------------------------------------------------------------------ */
/*  HOW IT WORKS                                                       */
/* ------------------------------------------------------------------ */
export const STEPS = [
  { n: '01', title: 'Choose the syllabus', body: 'Class, subject and the exact chapters you have covered so far.', icon: BookOpenCheck },
  { n: '02', title: 'Set the pattern', body: 'Marks split, question types, difficulty mix, medium and time allowed.', icon: Layers },
  { n: '03', title: 'Generate', body: 'A structured paper is assembled from your settings and the mapped question bank.', icon: WandSparkles },
  { n: '04', title: 'Review and print', body: 'Edit anything you want, then export the sheet with its answer key.', icon: Printer },
] as const

/* ------------------------------------------------------------------ */
/*  CAPABILITIES                                                       */
/*  ⚠ VERIFY EACH LINE against the codebase. Delete anything that is   */
/*  not implemented today — do not move it to a "coming soon" list.    */
/* ------------------------------------------------------------------ */
export const TEACHER_CAPABILITIES = [
  { icon: Layers, title: 'Chapter-level selection', body: 'Restrict a paper to exactly the portion you have taught — nothing beyond it.' },
  { icon: FileText, title: 'Structured paper assembly', body: 'Objective, short-answer and long-answer sections built from the mapped question bank.' },
  { icon: ClipboardCheck, title: 'Answer key alongside', body: 'The marking sheet is produced with the paper, not separately.' },
  { icon: Languages, title: 'Urdu and English', body: 'Set the paper in either medium, or print both columns on one sheet.' },
  { icon: Printer, title: 'Review before printing', body: 'Nothing reaches the printer that you have not read through first.' },
] as const

export const STUDENT_CAPABILITIES = [
  { icon: BookOpenCheck, title: 'Practise available chapters', body: 'Work through the subjects and chapters that are live for your class.' },
  { icon: ClipboardCheck, title: 'Attempt assigned work', body: 'Open what your teacher has assigned from your own portal.' },
  { icon: Target, title: 'See what is completed', body: 'A plain view of what you have attempted and what is still pending.' },
] as const

/* ------------------------------------------------------------------ */
/*  SECURITY — architectural facts only. No certifications claimed.    */
/*  ⚠ VERIFY each line matches your middleware / auth implementation.  */
/* ------------------------------------------------------------------ */
export const SECURITY_FACTS = [
  { icon: Lock, title: 'Authenticated workspaces', body: 'Teacher and student areas are reachable only after signing in.' },
  { icon: UserCog, title: 'Role-controlled access', body: 'What you can open is decided by your role, checked on the server.' },
  { icon: ShieldCheck, title: 'Protected administration', body: 'Platform administration runs in an internal workspace and is never linked from the public site.' },
] as const

/* ------------------------------------------------------------------ */
/*  MISSION — neutral. Named founder removed until approved.           */
/* ------------------------------------------------------------------ */
export const MISSION = {
  heading: `Why ${BRAND.full} exists`,
  lead: 'Setting a fair, syllabus-accurate paper takes a teacher most of an evening — finding the questions, balancing the marks, typing it out, then writing the key.',
  paras: [
    'ZeeShaoor.Pk takes the mechanical part of that work. You decide the class, the subject and the chapters; the workspace assembles a structured paper from a question bank that is mapped chapter by chapter, and hands it back for you to review.',
    'Every subject listed on this page has been checked against the syllabus before being switched on. Nothing is shown as available until that check is done.',
  ],
  line: 'Make serious exam preparation reachable for every Pakistani student — whatever city, school or income it has to travel through.',
} as const

/* ------------------------------------------------------------------ */
/*  FAQ — no admin references, no trial or billing promises.           */
/* ------------------------------------------------------------------ */
export const FAQS = [
  {
    q: 'How does the paper generator work?',
    a: 'You choose the class, subject, chapters, question types, marks and difficulty. The workspace assembles a structured paper from that configuration and the mapped question bank, then hands it back for review before you print.',
  },
  {
    q: 'Can I restrict a paper to specific chapters?',
    a: 'Yes. Chapter-level selection is the core of the generator, so a test can cover exactly the portion you have taught.',
  },
  {
    q: 'Which subjects are ready today?',
    a: CURRICULUM.map((c) => `${c.grade} ${c.subject} (Chapters ${c.chapterFrom}–${c.chapterTo})`).join(', ') +
      '. More subjects are switched on as each question bank is checked against the syllabus.',
  },
  {
    q: 'Are Urdu and English both supported?',
    a: 'Yes. A paper can be set in either medium, and where the question bank holds both, the two can be printed side by side.',
  },
  {
    q: 'How do I get access?',
    a: `Create an account, or message us on WhatsApp at ${CONTACT.phoneDisplay} and we will walk you through it.`,
  },
] as const

/* ------------------------------------------------------------------ */
/*  BOARD NEWS SOURCES                                                 */
/*  feed: an official RSS/Atom URL. Leave undefined when the board     */
/*  publishes no feed — that board then renders as an official link    */
/*  card instead of pretending a live feed exists.                     */
/* ------------------------------------------------------------------ */
export interface BoardSource {
  board: string
  site: string
  host: string
  feed?: string
}

export const BOARD_SOURCES: BoardSource[] = [
  { board: 'BISE Lahore', site: 'https://www.biselahore.com/', host: 'biselahore.com' },
  { board: 'FBISE Islamabad', site: 'https://www.fbise.edu.pk/', host: 'fbise.edu.pk' },
  { board: 'BISE Rawalpindi', site: 'https://www.biserawalpindi.edu.pk/', host: 'biserawalpindi.edu.pk' },
  { board: 'BISE Multan', site: 'https://www.bisemultan.edu.pk/', host: 'bisemultan.edu.pk' },
]