import {
  BookOpenCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Layers,
  Languages,
  LayoutDashboard,
  ListChecks,
  Lock,
  Printer,
  Rocket,
  ServerCog,
  ShieldCheck,
  Target,
  type LucideIcon,
} from 'lucide-react'

/* ==================================================================
   FEATURE FLAGS — flip these once the backend is verified.
   Everything downstream reads from here, so nothing is claimed twice.
   ================================================================== */
export const BILLING_IS_LIVE = false      // real subscription/trial/entitlement logic exists?
export const LEGAL_PAGES_EXIST = false    // /privacy and /terms actually render?
export const FOUNDER_CONFIRMED = false    // founder name/title/location approved for public display?

/* ==================================================================
   BRAND — official spelling. The P in .Pk is always capital.
   ================================================================== */
export const BRAND = {
  name: 'ZeeShaoor',
  tld: '.Pk',
  full: 'ZeeShaoor.Pk',
  tagline: 'Awakening intellect, anchoring truth',
} as const

/* ==================================================================
   ROUTES — single place to correct if a path changes.
   ================================================================== */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  teacher: '/teacher',
  student: '/student/dashboard',
  privacy: '/privacy',
  terms: '/terms',
} as const

/* ==================================================================
   CONTACT — one definition, reused in ticker, contact, footer, WhatsApp.
   ================================================================== */
export const CONTACT = {
  email: 'zeeshaoorofficial@gmail.com',
  phoneDisplay: '0316 0404585',
  phoneDial: '+923160404585',
  whatsappNumber: '923160404585',
  hours: 'Mon–Sat · 9am–9pm',
} as const

export const MAILTO = `mailto:${CONTACT.email}`
export const TEL = `tel:${CONTACT.phoneDial}`
export const WHATSAPP = `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(
  `Assalam-o-Alaikum, I need help with ${BRAND.full}`,
)}`

/* ==================================================================
   CURRICULUM — the ONLY curriculum definition on the landing page.
   Replace the array below with an import from your real registry
   (src/config/curriculum.ts) once the shapes are aligned. Everything
   else on the page derives from it, so nothing can drift out of sync.
   ================================================================== */
export interface CurriculumEntry {
  id: string
  gradeKey: '9' | '10'
  grade: string
  subject: string
  chapterFrom: number
  chapterTo: number
  note?: string
}

export const CURRICULUM: CurriculumEntry[] = [
  { id: 'c9-physics',    gradeKey: '9',  grade: 'Class 9',  subject: 'Physics',   chapterFrom: 1,  chapterTo: 9 },
  { id: 'c10-computer',  gradeKey: '10', grade: 'Class 10', subject: 'Computer',  chapterFrom: 1,  chapterTo: 8 },
  { id: 'c10-biology',   gradeKey: '10', grade: 'Class 10', subject: 'Biology',   chapterFrom: 1,  chapterTo: 10 },
  {
    id: 'c10-chemistry', gradeKey: '10', grade: 'Class 10', subject: 'Chemistry', chapterFrom: 14, chapterTo: 26,
    note: 'Chapter numbering continues from the previous class/book sequence.',
  },
]

/* ---- derived helpers: no hard-coded counts anywhere in the UI ---- */
export const chapterRange = (e: CurriculumEntry) => `Chapters ${e.chapterFrom}–${e.chapterTo}`

export const chapterNumbers = (e: CurriculumEntry) =>
  Array.from({ length: e.chapterTo - e.chapterFrom + 1 }, (_, i) => e.chapterFrom + i)

export const AVAILABLE_GRADES = Array.from(
  new Map(CURRICULUM.map((c) => [c.gradeKey, { key: c.gradeKey, label: c.grade }])).values(),
)

export const subjectsForGrade = (gradeKey: string) =>
  CURRICULUM.filter((c) => c.gradeKey === gradeKey)

export const AVAILABILITY = [
  { value: String(AVAILABLE_GRADES.length),                  label: 'Classes available now' },
  { value: String(CURRICULUM.length),                        label: 'Subjects available now' },
  { value: String(CURRICULUM.reduce((n, c) => n + chapterNumbers(c).length, 0)), label: 'Chapters mapped' },
  { value: '2',                                              label: 'Mediums — Urdu & English' },
]

/* Classes with no verified content. Rendered as non-clickable cards. */
export const PLANNED_GRADES = ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 11', 'Class 12']

/* ==================================================================
   NAVIGATION
   ================================================================== */
export const NAV_LINKS = [
  { id: 'how',      label: 'How it works' },
  { id: 'features', label: 'Features' },
  { id: 'classes',  label: 'Classes' },
  { id: 'pricing',  label: 'Pricing' },
  { id: 'contact',  label: 'Contact' },
] as const

/* ==================================================================
   ANNOUNCEMENT BAR — verified content only.
   No trial, no card promise, no prices, no usage statistics.
   ================================================================== */
export const TICKER_ITEMS: string[] = [
  BRAND.tagline,
  `Welcome to ${BRAND.full}`,
  ...CURRICULUM.map((c) => `${c.grade} ${c.subject} — ${chapterRange(c)} available`),
  'Create curriculum-aligned papers in minutes',
  'Urdu and English academic workspace',
  `Email: ${CONTACT.email}`,
  `Contact: ${CONTACT.phoneDisplay}`,
  'Latest board news from official sources',
]

/* ==================================================================
   HOW IT WORKS
   ================================================================== */
export const STEPS: { n: string; title: string; body: string; icon: LucideIcon }[] = [
  { n: '01', title: 'Choose the syllabus', body: 'Class, subject, and the exact chapters you have covered so far.', icon: BookOpenCheck },
  { n: '02', title: 'Set the structure',   body: 'Question types, marks split and the medium the paper is set in.',  icon: Layers },
  { n: '03', title: 'Generate',            body: 'A structured paper is assembled from your settings and the mapped question bank.', icon: ListChecks },
  { n: '04', title: 'Review and export',   body: 'Check every question before anything is printed or assigned.',     icon: Printer },
]

/* ==================================================================
   FEATURES — split by audience. Only what the app actually does.
   Delete any line you cannot point to in the codebase.
   ================================================================== */
export const TEACHER_BENEFITS: { title: string; body: string; icon: LucideIcon }[] = [
  { icon: Layers,         title: 'Chapter-level selection',   body: 'Restrict a paper to exactly the portion you have taught — nothing beyond it appears on the sheet.' },
  { icon: ClipboardCheck, title: 'Structured paper assembly', body: 'Objective, short-answer and long-answer sections are laid out from the mapped question bank.' },
  { icon: FileText,       title: 'Review before release',     body: 'Every question is shown for review, so nothing is printed that you have not looked at first.' },
  { icon: Languages,      title: 'Urdu and English',          body: 'Set the paper in either medium from the bilingual question bank.' },
]

export const STUDENT_BENEFITS: { title: string; body: string; icon: LucideIcon }[] = [
  { icon: LayoutDashboard, title: 'Student workspace',    body: 'Sign in to reach the practice and assessment tools assigned to your account.' },
  { icon: BookOpenCheck,   title: 'Practise by chapter',  body: 'Work through the chapters that are available for your class and subject.' },
  { icon: Target,          title: 'Track what you attempt', body: 'Attempts are recorded against your account so you can see what you have covered.' },
]

/* ==================================================================
   SECURITY — architecture facts only. No certifications claimed.
   ================================================================== */
export const SECURITY_FACTS: { title: string; body: string; icon: LucideIcon }[] = [
  { icon: Lock,       title: 'Authenticated workspaces', body: 'Teacher and student areas require a signed-in account. Nothing inside them is reachable publicly.' },
  { icon: ShieldCheck,title: 'Role-controlled access',   body: 'What an account can open is decided by its role on the server, not by hiding links in the interface.' },
  { icon: ServerCog,  title: 'Server-side checks',       body: 'Authorization is enforced on the server for every protected route and request.' },
]

/* ==================================================================
   PORTALS — Admin is deliberately absent. Not a `hidden` flag: absent.
   ================================================================== */
export const PORTALS: { title: string; tagline: string; href: string; icon: LucideIcon; points: string[] }[] = [
  {
    title: 'Teacher Portal',
    tagline: 'Build a paper from the chapters you have taught, then review it before it goes out.',
    href: ROUTES.teacher,
    icon: GraduationCap,
    points: ['Paper generator', 'Chapter-level control', 'Review before export'],
  },
  {
    title: 'Student Portal',
    tagline: 'Reach the practice and assessment tools assigned to your account.',
    href: ROUTES.student,
    icon: Rocket,
    points: ['Practice by chapter', 'Assigned assessments', 'Attempt history'],
  },
]

/* ==================================================================
   MISSION (used when FOUNDER_CONFIRMED is false)
   ================================================================== */
export const MISSION = {
  heading: `Why ${BRAND.full} exists`,
  line: 'Make serious exam preparation reachable for every Pakistani student — whatever city, school or income it has to travel through.',
  paragraphs: [
    'Setting a fair paper takes a teacher an evening. Finding the right questions, matching them to the chapters actually taught, keeping the marks balanced — it is careful work, and it is the same careful work every term.',
    `${BRAND.full} is built to take that work down to minutes without taking the teacher out of the decision. You choose the class, the subject and the chapters. Every question is shown for review before anything is printed.`,
    `${BRAND.tagline} is not a slogan. It is the standard the question bank is held to — each item mapped to a real chapter, in Urdu or English, checked before it goes in.`,
  ],
}

/* ==================================================================
   BOARD NEWS — official sources only.
   ================================================================== */
export interface BoardSource {
  board: string
  region: string
  url: string
}

export const BOARD_SOURCES: BoardSource[] = [
  { board: 'BISE Lahore',      region: 'Punjab',           url: 'https://www.biselahore.com/' },
  { board: 'BISE Rawalpindi',  region: 'Punjab',           url: 'https://www.biserawalpindi.edu.pk/' },
  { board: 'BISE Gujranwala',  region: 'Punjab',           url: 'https://www.bisegrw.edu.pk/' },
  { board: 'BISE Multan',      region: 'Punjab',           url: 'https://www.bisemultan.edu.pk/' },
  { board: 'BISE Faisalabad',  region: 'Punjab',           url: 'https://www.bisefsd.edu.pk/' },
  { board: 'FBISE Islamabad',  region: 'Federal',          url: 'https://www.fbise.edu.pk/' },
]

/* ==================================================================
   FAQ — no admin copy, no trial/billing promises.
   ================================================================== */
export const FAQS = [
  {
    q: 'How does the paper generator work?',
    a: 'You choose the class, subject and chapters, then set the question types and marks split. A structured paper is assembled from that configuration and the mapped question bank, and handed back for review before you export it.',
  },
  {
    q: 'Can I restrict a paper to specific chapters?',
    a: 'Yes. Chapter-level selection is the core of the generator, so a test can cover exactly the portion you have taught and nothing beyond it.',
  },
  {
    q: 'Which classes and subjects are ready today?',
    a: `${CURRICULUM.map((c) => `${c.grade} ${c.subject} (${chapterRange(c).toLowerCase()})`).join(', ')}. More subjects are added as each question bank is checked chapter by chapter.`,
  },
  {
    q: `Is ${BRAND.full} affiliated with any examination board?`,
    a: 'No. Board news links point to official board websites, and nothing on this site is endorsed by or affiliated with any board, publisher or institution.',
  },
  {
    q: 'Which medium can papers be set in?',
    a: 'Urdu or English, drawn from the bilingual question bank.',
  },
]