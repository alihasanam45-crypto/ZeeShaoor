import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  BrainCircuit,
  Check,
  ClipboardCheck,
  Download,
  FileText,
  Gauge,
  GraduationCap,
  Languages,
  Layers,
  Mail,
  MapPin,
  Phone,
  Printer,
  Rocket,
  Shield,
  Target,
  Timer,
  Users,
  WandSparkles,
} from 'lucide-react'

import { BoardNews, FloatingWhatsApp, ThemeToggle } from './landing-parts'
import { InteractiveSheet } from './landing-generator'

export const metadata: Metadata = {
  title: 'ZeeShaoor.pk — Set a full board paper in ninety seconds',
  description:
    'A paper-generation workspace for Pakistani teachers and students. Choose the board, class, subject and chapters — get a board-pattern paper with its answer key, in English or Urdu.',
  openGraph: {
    title: 'ZeeShaoor.pk — Set a full board paper in ninety seconds',
    description:
      'Board-pattern papers with the answer key attached — objective, short and long, in Urdu or English.',
    siteName: 'ZeeShaoor.pk',
    locale: 'en_PK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZeeShaoor.pk — Set a full board paper in ninety seconds',
    description:
      'Board-pattern papers with the answer key attached — objective, short and long, in Urdu or English.',
  },
}

/* ================================================================== */
/*  CONTENT — edit these arrays, the layout follows                    */
/* ================================================================== */

/* Portals. Admin lives here but never renders publicly — reach /admin
   directly. */
const PORTALS = [
  {
    title: 'Admin Console',
    tagline: 'School pulse, AI controls and system health.',
    href: '/admin',
    icon: Shield,
    points: [] as string[],
    hidden: true,
  },
  {
    title: 'Teacher Portal',
    tagline:
      'Build a paper, run the class, and see which topics still need another day.',
    href: '/teacher',
    icon: GraduationCap,
    points: ['Paper generator', 'Class analytics', 'Parent reports'],
    hidden: false,
  },
  {
    title: 'Student Launchpad',
    tagline:
      'Practise real board papers, shrink your weak topics, and time yourself like the exam hall.',
    href: '/student/dashboard',
    icon: Rocket,
    points: ['Attempt timer', 'Weak-topic radar', 'Flashcards'],
    hidden: false,
  },
]
const PUBLIC_PORTALS = PORTALS.filter((p) => !p.hidden)

const BOARDS = [
  'BISE Lahore',
  'BISE Rawalpindi',
  'BISE Multan',
  'BISE Gujranwala',
  'BISE Faisalabad',
  'BISE Sargodha',
  'BISE Sahiwal',
  'BISE DG Khan',
  'BISE Bahawalpur',
  'FBISE Islamabad',
  'AJK Board',
]

/* Product facts — swap in real traction numbers once you can back them up. */
const FACTS = [
  { value: '8', label: 'Classes covered' },
  { value: '2', label: 'Mediums — Urdu & English' },
  { value: '10 yrs', label: 'Past papers archived' },
  { value: '4', label: 'AI engines' },
]

/* Live now. Keep this honest — it is what teachers will test first. */
const CURRICULUM = [
  { grade: 'Class 9', subject: 'Physics', chapters: 'Chapters 1–9', note: '' },
  { grade: 'Class 10', subject: 'Computer', chapters: 'Chapters 1–8', note: '' },
  { grade: 'Class 10', subject: 'Biology', chapters: 'Chapters 1–10', note: '' },
  {
    grade: 'Class 10',
    subject: 'Chemistry',
    chapters: 'Chapters 14–26',
    note: 'Numbering continues from the previous book in the sequence.',
  },
]

/* Flip `live` to true as each grade's question bank goes in. */
const CLASSES = [
  { grade: '5th', subjects: 3, live: false },
  { grade: '6th', subjects: 4, live: false },
  { grade: '7th', subjects: 5, live: false },
  { grade: '8th', subjects: 5, live: false },
  { grade: '9th', subjects: 7, live: true },
  { grade: '10th', subjects: 7, live: true },
  { grade: '11th', subjects: 8, live: false },
  { grade: '12th', subjects: 8, live: false },
]

const STEPS = [
  {
    n: '01',
    title: 'Choose the syllabus',
    body: 'Board, class, subject, and the exact chapters you have covered so far.',
    icon: BookOpenCheck,
  },
  {
    n: '02',
    title: 'Set the pattern',
    body: 'Marks split, question types, difficulty mix, medium and time allowed.',
    icon: Layers,
  },
  {
    n: '03',
    title: 'Generate',
    body: 'A structured paper is laid out from your settings and the mapped question bank.',
    icon: WandSparkles,
  },
  {
    n: '04',
    title: 'Review and print',
    body: 'Edit anything, then export the PDF with its answer key — or assign it as a timed test.',
    icon: Printer,
  },
]

const FEATURES = [
  {
    icon: Layers,
    title: 'Every question knows where it came from',
    body: 'Each item is mapped to a chapter, a topic and the year it last appeared in a board paper. Nothing lands on the sheet by accident.',
  },
  {
    icon: Languages,
    title: 'English and Urdu on one sheet',
    body: 'Set the paper in either medium, or print both columns side by side in proper Nastaliq.',
  },
  {
    icon: FileText,
    title: 'Version A and Version B',
    body: 'Same syllabus, same weightage, different sheets — so seatmates are not answering the same question.',
  },
  {
    icon: ClipboardCheck,
    title: 'Answer checking that explains itself',
    body: 'Attempts are marked against the board pattern, with the reason a mark was lost written next to it.',
  },
  {
    icon: Timer,
    title: 'Exam-hall simulator',
    body: 'A timed attempt with the real paper on screen — same duration, same section order, no second chances.',
  },
  {
    icon: BrainCircuit,
    title: 'Brain Gym and flashcards',
    body: 'Short adaptive sessions and spaced repetition that keep coming back to what a student keeps missing.',
  },
  {
    icon: Target,
    title: 'Weak-topic radar',
    body: 'After marking, the class view names the three topics costing the most marks — and what to do next.',
  },
  {
    icon: Users,
    title: 'Weekly report to parents',
    body: 'A plain summary of attendance, attempts and progress, sent without anyone having to compile it.',
  },
]

const DATE_SHEETS = [
  { name: 'Matric Part-I — Class 9', href: 'https://www.biselahore.com/datesheet' },
  { name: 'Matric Part-II — Class 10', href: 'https://www.biselahore.com/datesheet' },
  { name: 'Inter Part-I — Class 11', href: 'https://www.biselahore.com/datesheet' },
  { name: 'Inter Part-II — Class 12', href: 'https://www.biselahore.com/datesheet' },
]

const PRICING = [
  {
    name: 'ZeeShaoor Pro',
    price: '1,000',
    period: 'per month',
    forWhom: 'One student, everything unlocked.',
    badge: '',
    featured: false,
    features: [
      'One student account',
      'Unlimited paper generation',
      'All four AI engines',
      'Progress dashboard',
      'Past papers — ten years',
      'Weekly parent report',
      'Email support',
    ],
    cta: 'Start free trial',
    href: '/register',
  },
  {
    name: 'Institute',
    price: '2,000',
    period: 'per month',
    forWhom: 'A whole school, one account.',
    badge: 'Most schools pick this',
    featured: true,
    features: [
      'Unlimited student accounts',
      'Everything in ZeeShaoor Pro',
      'Teacher portal and class management',
      'Institution-wide analytics',
      'School-branded paper bank',
      'Bulk student onboarding',
      'Priority WhatsApp support',
      'Named account manager',
    ],
    cta: 'Get school access',
    href: '/register',
  },
]

const FOUNDER_VISION = [
  'In Pakistan, millions of students prepare for board exams without proper guidance, quality resources, or intelligent feedback. They spend hours memorising without understanding — and the system fails them.',
  'ZeeShaoor.pk was born from a single conviction: every Pakistani student deserves access to the same quality of preparation that was once reserved for elite coaching centres.',
  'ZeeShaoor does not just hand a student practice papers — it learns how that student thinks, finds the gaps, and builds a path through them.',
  'Awakening intellect, anchoring truth is not a tagline. It is a promise that a student who learns here will carry real understanding forward, long after the board result.',
]

const FAQS = [
  {
    q: 'How does the paper generator actually work?',
    a: 'You choose the class, subject, chapters, question types, marks and difficulty. ZeeShaoor assembles a structured paper from that configuration and the mapped question bank, then hands it back for review before you print.',
  },
  {
    q: 'Can I restrict a paper to specific chapters?',
    a: 'Yes — chapter-level selection is the core of the generator, so a test can cover exactly the portion you have taught and nothing beyond it.',
  },
  {
    q: 'Which subjects are ready today?',
    a: 'Class 9 Physics, and Class 10 Computer, Biology and Chemistry. More subjects are added as each question bank is verified against the board syllabus.',
  },
  {
    q: 'Can students use it on their own, without a school?',
    a: 'Yes. The ZeeShaoor Pro plan is a single student account with the full toolset — no institution required.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Every plan starts with a seven-day trial and no card up front.',
  },
  {
    q: 'Is platform administration available publicly?',
    a: 'No. Administration runs in a protected internal workspace and is never linked from the public site.',
  },
]

const WHATSAPP_NUM = '923160404585'
const WHATSAPP_SUPPORT = `https://wa.me/${WHATSAPP_NUM}?text=Assalam-o-Alaikum%2C%20I%20need%20help%20with%20ZeeShaoor`

/* Announcement bar — verified content only.
   The old first item was "Welcome to ZeeShaoor.Pk". A greeting carries no
   information and costs the most valuable slot in the loop, so it now opens
   on what the product does. */
const TICKER_ITEMS: string[] = [
  'Board-pattern papers with the answer key attached',
  'Class 9 Physics — chapters 1–9 available',
  'Class 10 Computer — chapters 1–8 available',
  'Class 10 Biology — chapters 1–10 available',
  'Class 10 Chemistry — chapters 14–26 available',
  'Urdu and English on the same sheet',
  'Teacher and student portals',
  'Latest official board updates',
  'Email: zeeshaoorofficial@gmail.com',
  'Contact: 0316 0404585',
]

/* entrance-delay helper */
const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

/* ================================================================== */

export default function Home() {
  return (
    <div className="zs">
      {/* ---------- Welcome entrance — CSS-only, plays once (~3.9s: mark
          and text settle in, hold with an ambient glow + breathing logo,
          then fade). The hero underneath animates in on its own timers
          (see .zs-in / --d below) while this covers it, so lifting the
          curtain reveals an already-composed page. ---------- */}
      <div className="zs-welcome" aria-hidden="true">
        <span className="zs-welcome-glow" />
        <span className="zs-welcome-mark">
          <Image src="/logo.png" alt="" width={104} height={104} priority />
        </span>
        <p className="zs-welcome-text">
          Welcome to ZeeShaoor<span className="zs-hl">.Pk</span>
        </p>
      </div>

      {/* Theme runs from src/app/layout.tsx, before first paint.
          It must not be repeated here — a <script> inside a page component
          is never executed on client-side navigation. */}

      {/* ---------- Fonts ---------- */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        precedence="high"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap"
      />
      <style href="zs-landing" precedence="high">{ZS_CSS}</style>

      {/* ---------- Top announcement bar — seamless marquee ---------- */}
      <div className="zs-ticker" aria-label="ZeeShaoor.Pk announcements">
        <p className="zs-sr-only">{TICKER_ITEMS.join('. ')}.</p>
        <div className="zs-ticker-viewport" aria-hidden="true">
          <div className="zs-ticker-track">
            {[0, 1].map((k) => (
              <span key={k} className="zs-ticker-run">
                {TICKER_ITEMS.map((item, i) => (
                  <span key={i} className="zs-ticker-item">
                    {item}
                    <i>◆</i>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Nav ---------- */}
      <header className="zs-nav">
        <Link href="/" className="zs-brand" aria-label="ZeeShaoor.pk home">
          <Image src="/logo.png" alt="" width={38} height={38} priority className="zs-brand-mark" />
          <span className="zs-brand-word">
            ZeeShaoor<span className="zs-brand-tld">.Pk</span>
          </span>
        </Link>

        <nav className="zs-nav-links" aria-label="Primary">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#classes">Classes</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="zs-nav-cta">
          <ThemeToggle />
          <Link href="/login" className="zs-btn zs-btn-ghost">
            Log in
          </Link>
          <Link href="/register" className="zs-btn zs-btn-solid">
            Sign up
          </Link>
          <details className="zs-mnav">
            <summary aria-label="Open menu">
              <span className="zs-burger" aria-hidden />
            </summary>
            <div className="zs-mnav-panel">
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
              <a href="#classes">Classes</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Contact</a>
              <Link href="/login">Log in</Link>
              <Link href="/register">Sign up</Link>
            </div>
          </details>
        </div>
      </header>

      <main id="main-content">
        {/* ================= HERO ================= */}
        <section className="zs-hero">
          <div className="zs-hero-copy">
            <p className="zs-eyebrow zs-in" style={d(0)}>
              <span className="zs-dot" />
              BISE pattern · Urdu &amp; English
            </p>

            <h1 className="zs-h1 zs-in" style={d(80)}>
              A full board paper.
              <br />
              Set in <em>ninety seconds.</em>
            </h1>

            <p className="zs-lede zs-in" style={d(160)}>
              Pick the board, class, subject and chapters. ZeeShaoor lays out a
              board-pattern paper — objective, short and long — with the{' '}
              <span className="zs-hl">answer key</span> and marking scheme
              printed alongside it.
            </p>

            <div className="zs-actions zs-in" style={d(240)}>
              <Link href="/register" className="zs-btn zs-btn-solid zs-btn-lg">
                Start a paper
                <ArrowRight className="zs-ico" aria-hidden />
              </Link>
              <Link href="/teacher" className="zs-btn zs-btn-outline zs-btn-lg">
                See a sample sheet
                <ArrowUpRight className="zs-ico" aria-hidden />
              </Link>
            </div>

            <ul className="zs-assure zs-in" style={d(320)}>
              <li>
                <Check className="zs-tick" aria-hidden /> Seven-day trial
              </li>
              <li>
                <Check className="zs-tick" aria-hidden /> No card to begin
              </li>
              <li>
                <Check className="zs-tick" aria-hidden /> Print-ready PDF
              </li>
            </ul>
          </div>

          {/* ---- signature: the sheet, now interactive ---- */}
          <InteractiveSheet />
        </section>

        {/* ---- facts ---- */}
        <section className="zs-facts" aria-label="At a glance">
          {FACTS.map((f) => (
            <div key={f.label}>
              <span className="zs-fact-v">{f.value}</span>
              <span className="zs-fact-l">{f.label}</span>
            </div>
          ))}
        </section>

        {/* ---- boards marquee ---- */}
        <section className="zs-marquee" aria-label="Boards covered">
          <div className="zs-marquee-track">
            {[...BOARDS, ...BOARDS].map((b, i) => (
              <span key={`${b}-${i}`} className="zs-marquee-item">
                {b}
                <i aria-hidden>◆</i>
              </span>
            ))}
          </div>
        </section>

        {/* ================= HOW ================= */}
        <section id="how" className="zs-band">
          <header className="zs-band-head">
            <p className="zs-label">In order</p>
            <h2 className="zs-h2">Four decisions, then it&apos;s a paper.</h2>
            <p className="zs-band-sub">
              You stay in control at every step — nothing is printed that you
              have not looked at first.
            </p>
          </header>

          <ol className="zs-steps">
            {STEPS.map((s) => (
              <li key={s.n} className="zs-step zs-reveal">
                <span className="zs-step-top">
                  <s.icon aria-hidden />
                  <span className="zs-step-n">{s.n}</span>
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ================= CURRICULUM ================= */}
        <section id="curriculum" className="zs-band zs-band-alt">
          <header className="zs-band-head">
            <p className="zs-label">Ready today</p>
            <h2 className="zs-h2">Verified syllabus, not a promise.</h2>
            <p className="zs-band-sub">
              These question banks have been checked against the board syllabus
              chapter by chapter. Everything else is on the way.
            </p>
          </header>

          <div className="zs-curric">
            {CURRICULUM.map((c) => (
              <article key={`${c.grade}-${c.subject}`} className="zs-cur zs-reveal">
                <p className="zs-mono">{c.grade}</p>
                <h3>{c.subject}</h3>
                <p className="zs-cur-ch">{c.chapters}</p>
                {c.note && <p className="zs-cur-note">{c.note}</p>}
                <span className="zs-cur-live">
                  <span className="zs-live" aria-hidden /> Live
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* ================= CLASSES ================= */}
        <section id="classes" className="zs-band">
          <header className="zs-band-head">
            <p className="zs-label">Coverage</p>
            <h2 className="zs-h2">Class 5 through 12.</h2>
            <p className="zs-band-sub">
              Matric is live now. The rest open as each question bank clears
              review — pick a class to see what it holds today.
            </p>
          </header>

          <div className="zs-classes">
            {CLASSES.map((c) => (
              <Link
                key={c.grade}
                href={`/student/dashboard?class=${c.grade}`}
                className={c.live ? 'zs-class zs-class-live' : 'zs-class'}
              >
                <span className="zs-class-n">{c.grade}</span>
                <span className="zs-class-s">{c.subjects} subjects</span>
                <span className="zs-class-tag">{c.live ? 'Live' : 'Soon'}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section id="features" className="zs-band zs-band-alt">
          <header className="zs-band-head">
            <p className="zs-label">What you get</p>
            <h2 className="zs-h2">
              The parts a teacher actually spends the evening on.
            </h2>
          </header>

          <div className="zs-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="zs-card zs-reveal">
                <f.icon className="zs-card-ico" aria-hidden />
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                {f.title === 'Version A and Version B' && (
                  <div className="zs-shuffle" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ================= NEWS + DATE SHEETS ================= */}
        <section className="zs-band">
          <header className="zs-band-head">
            <p className="zs-label">From the boards</p>
            <h2 className="zs-h2">Date sheets and notices, in one place.</h2>
            <p className="zs-band-sub">
              Pulled from official board sources so nobody has to keep checking
              six websites.
            </p>
          </header>

          <div className="zs-two">
            <BoardNews />

            <div className="zs-panel">
              <div className="zs-panel-head">
                <span className="zs-panel-title">
                  <Download aria-hidden /> Date sheets
                </span>
                <span className="zs-mono">BISE Lahore</span>
              </div>
              <ul className="zs-ds-list">
                {DATE_SHEETS.map((ds) => (
                  <li key={ds.name}>
                    <a href={ds.href} target="_blank" rel="noopener noreferrer">
                      <FileText aria-hidden />
                      <span>
                        <strong>{ds.name}</strong>
                        <em>Opens the official board page</em>
                      </span>
                      <ArrowUpRight aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= PRICING ================= */}
        <section id="pricing" className="zs-band zs-band-alt">
          <header className="zs-band-head">
            <p className="zs-label">Pricing</p>
            <h2 className="zs-h2">Two plans. Both start free.</h2>
            <p className="zs-band-sub">
              Seven days to try everything, no card up front, and you can leave
              whenever you like.
            </p>
          </header>

          <div className="zs-price">
            {PRICING.map((p) => (
              <article
                key={p.name}
                className={p.featured ? 'zs-plan zs-plan-featured' : 'zs-plan'}
              >
                {p.badge && <span className="zs-plan-badge">{p.badge}</span>}
                <h3>{p.name}</h3>
                <p className="zs-plan-for">{p.forWhom}</p>
                <p className="zs-plan-price">
                  <span className="zs-plan-cur">PKR</span>
                  <span className="zs-plan-num">{p.price}</span>
                  <span className="zs-plan-per">{p.period}</span>
                </p>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>
                      <Check aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={
                    p.featured
                      ? 'zs-btn zs-btn-solid zs-btn-lg zs-btn-full'
                      : 'zs-btn zs-btn-outline zs-btn-lg zs-btn-full'
                  }
                >
                  {p.cta}
                  <ArrowRight className="zs-ico" aria-hidden />
                </Link>
              </article>
            ))}
          </div>

          <p className="zs-price-note">
            <Gauge aria-hidden /> The Institute plan covers every student and
            teacher in one school — there is no per-seat charge.
          </p>
        </section>

        {/* ================= PORTALS ================= */}
        <section id="portals" className="zs-band">
          <header className="zs-band-head">
            <p className="zs-label">Sign in as</p>
            <h2 className="zs-h2">Two ways into the same platform.</h2>
          </header>

          <div className="zs-portals">
            {PUBLIC_PORTALS.map((p) => (
              <Link key={p.title} href={p.href} className="zs-portal zs-reveal">
                <span className="zs-portal-ico">
                  <p.icon aria-hidden />
                </span>
                <h3>{p.title}</h3>
                <p>{p.tagline}</p>
                <ul>
                  {p.points.map((pt) => (
                    <li key={pt}>
                      <Check aria-hidden /> {pt}
                    </li>
                  ))}
                </ul>
                <span className="zs-portal-go">
                  Open <ArrowRight aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= FOUNDER / CONTACT ================= */}
        <section id="contact" className="zs-band zs-band-alt">
          <header className="zs-band-head">
            <p className="zs-label">Why this exists</p>
            <h2 className="zs-h2">A note from the founder.</h2>
          </header>

          <div className="zs-two zs-two-wide">
            <article className="zs-panel">
              <div className="zs-founder">
                <span className="zs-founder-face" aria-hidden>
                  A
                </span>
                <div>
                  <h3>Ali Hasan</h3>
                  <p className="zs-mono">Lead educator &amp; founder</p>
                  <p className="zs-founder-loc">
                    <MapPin aria-hidden /> Lahore, Pakistan
                  </p>
                </div>
              </div>
              {FOUNDER_VISION.map((para, i) => (
                <p key={i} className="zs-vision-p">
                  {para}
                </p>
              ))}
            </article>

            <div className="zs-contact-col">
              <div className="zs-panel zs-mission">
                <p className="zs-label">The mission</p>
                <p className="zs-mission-line">
                  Make serious exam preparation reachable for every Pakistani
                  student — whatever city, school or income it has to travel
                  through.
                </p>
              </div>

              <div className="zs-panel">
                <div className="zs-panel-head">
                  <span className="zs-panel-title">Talk to us</span>
                  <span className="zs-mono">Mon–Sat · 9am–9pm</span>
                </div>
                <ul className="zs-contact">
                  <li>
                    <Phone aria-hidden />
                    <span>
                      <strong>+92 316 0404585</strong>
                      <em>WhatsApp — fastest reply</em>
                    </span>
                  </li>
                  <li>
                    <Mail aria-hidden />
                    <span>
                      <strong>zeeshaoorofficial@gmail.com</strong>
                      <em>Email</em>
                    </span>
                  </li>
                </ul>
                <a
                  href={WHATSAPP_SUPPORT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zs-btn zs-btn-wa zs-btn-lg zs-btn-full"
                >
                  Message on WhatsApp
                  <ArrowUpRight className="zs-ico" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section id="faq" className="zs-band">
          <header className="zs-band-head">
            <p className="zs-label">Questions</p>
            <h2 className="zs-h2">Before you start.</h2>
          </header>

          <div className="zs-faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>
                  <span>{f.q}</span>
                  <i aria-hidden>+</i>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ================= CLOSE ================= */}
        <section className="zs-close">
          <h2 className="zs-h2">
            Set tomorrow&apos;s test <em>tonight.</em>
          </h2>
          <p>
            Make your first paper free. Keep it, edit it, print it — no card
            needed to find out whether it fits your class.
          </p>
          <div className="zs-actions zs-actions-center">
            <Link href="/register" className="zs-btn zs-btn-solid zs-btn-lg">
              Start a paper
              <ArrowRight className="zs-ico" aria-hidden />
            </Link>
            <Link href="/login" className="zs-btn zs-btn-outline zs-btn-lg">
              I already have an account
            </Link>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="zs-foot">
        <div className="zs-foot-grid">
          <div className="zs-foot-about">
            <Link href="/" className="zs-brand">
              <Image src="/logo.png" alt="" width={34} height={34} className="zs-brand-mark" />
              <span className="zs-brand-word">
                ZeeShaoor<span className="zs-brand-tld">.Pk</span>
              </span>
            </Link>
            <p>
              A paper-generation workspace for Pakistani classrooms. Awakening
              intellect, anchoring truth.
            </p>
          </div>

          <div>
            <p className="zs-foot-h">Product</p>
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#curriculum">Curriculum</a>
            <a href="#pricing">Pricing</a>
          </div>

          <div>
            <p className="zs-foot-h">Workspaces</p>
            <Link href="/teacher">Teacher portal</Link>
            <Link href="/student/dashboard">Student launchpad</Link>
            <Link href="/login">Log in</Link>
            <Link href="/register">Create account</Link>
          </div>

          <div>
            <p className="zs-foot-h">Company</p>
            <a href="#contact">Contact</a>
            <a href="#faq">FAQ</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>

        <div className="zs-foot-base">
          <span className="zs-foot-copy">© {new Date().getFullYear()} ZeeShaoor.pk</span>
          <span className="zs-foot-copy">Built in Pakistan</span>
        </div>
      </footer>

      <FloatingWhatsApp href={WHATSAPP_SUPPORT} />

      {/* ---------- Mobile sticky CTA — thumb-zone bar, mobile only ---------- */}
      <div className="zs-sticky-cta">
        <Link href="/register" className="zs-btn zs-btn-solid zs-btn-lg zs-btn-full">
          Start a paper
          <ArrowRight className="zs-ico" aria-hidden />
        </Link>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  STYLES — swap the colour tokens at the top to re-skin everything   */
/* ================================================================== */
const ZS_CSS = `
/* tells the browser to theme scrollbars, form controls and the canvas */
html[data-theme='dark']{color-scheme:dark}
html[data-theme='light']{color-scheme:light}

.zs{
  --ink:#07110E;
  --ink-2:#0B1713;
  --ink-3:#10201A;
  --line:rgba(244,239,227,.10);
  --line-2:rgba(244,239,227,.18);
  --paper:#FBF7EC;
  --paper-2:#F1EADA;
  --paper-rule:#D8CFB9;
  --green:#087A55;
  --green-lit:#39C995;
  --brass:#D6AD32;
  --red:#B93B2B;
  --wa:#25D366;
  --fg:#F4EFE3;
  --fg-mute:#A9B3AD;

  /* derived — these are what make the light theme possible */
  --edge-lit:color-mix(in srgb,var(--green-lit) 35%,transparent);
  --edge-brass:color-mix(in srgb,var(--brass) 30%,transparent);
  --glow:rgba(8,122,85,.30);
  --glass:color-mix(in srgb,var(--ink-2) 70%,transparent);
  --on-accent:#06281A;
  --pulse:color-mix(in srgb,var(--green-lit) 55%,transparent);
  --shadow-sheet:0 30px 80px rgba(0,0,0,.55),0 0 0 1px rgba(0,0,0,.15);
  --shadow-lg:0 24px 70px rgba(0,0,0,.45);
  --shadow-md:0 16px 40px rgba(0,0,0,.5);

  --serif:'Instrument Serif',Georgia,serif;
  --sans:'Instrument Sans',ui-sans-serif,system-ui,sans-serif;
  --mono:'JetBrains Mono',ui-monospace,monospace;
  --urdu:'Noto Nastaliq Urdu',serif;

  background:var(--ink);
  color:var(--fg);
  font-family:var(--sans);
  transition:background-color .3s ease,color .3s ease;
  min-height:100vh;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
}
.zs *{box-sizing:border-box}
.zs a{color:inherit;text-decoration:none}
.zs :focus-visible{outline:2px solid var(--green-lit);outline-offset:3px;border-radius:6px}
.zs h1,.zs h2,.zs h3{margin:0}
.zs p{margin:0}

/* ---- light theme ---------------------------------------------------
   Only the tokens change. Every surface, border and text colour in the
   sheet below already reads from them, so the whole page follows.
   The paper preview deliberately keeps its cream/ink palette in both
   themes — a printed sheet does not go dark.                          */
html[data-theme='light'] .zs{
  --ink:#F4F7F5;
  --ink-2:#FFFFFF;
  --ink-3:#EAF0ED;
  --line:rgba(16,24,21,.12);
  --line-2:rgba(16,24,21,.22);
  --paper:#FFFDF7;
  --paper-2:#F3EDDF;
  --green:#087A55;
  --green-lit:#087A55;
  --brass:#8A6700;
  --fg:#101815;
  --fg-mute:#52605A;

  --edge-lit:color-mix(in srgb,var(--green-lit) 45%,transparent);
  --edge-brass:color-mix(in srgb,var(--brass) 40%,transparent);
  --glow:rgba(8,122,85,.12);
  --glass:color-mix(in srgb,#FFFFFF 78%,transparent);
  --on-accent:#FBF7EC;
  --pulse:color-mix(in srgb,var(--green-lit) 35%,transparent);
  --shadow-sheet:0 24px 60px rgba(16,24,21,.14),0 0 0 1px rgba(16,24,21,.08);
  --shadow-lg:0 20px 50px rgba(16,24,21,.12);
  --shadow-md:0 14px 34px rgba(16,24,21,.14);
}

/* ---- ticker — true seamless marquee ---- */
.zs-ticker{
  position:relative;overflow:hidden;height:36px;display:flex;align-items:center;
  background:linear-gradient(180deg,color-mix(in srgb,var(--green) 90%,#000) 0%,var(--green) 100%);
  border-top:1px solid color-mix(in srgb,#fff 12%,transparent);
  border-bottom:1px solid color-mix(in srgb,#000 24%,transparent);
}
.zs-ticker-viewport{
  position:relative;width:100%;height:100%;overflow:hidden;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 5%,#000 95%,transparent 100%);
  mask-image:linear-gradient(90deg,transparent 0,#000 5%,#000 95%,transparent 100%);
}
.zs-ticker-track{
  display:flex;align-items:center;height:100%;width:max-content;
  animation:zs-ticker-slide 52s linear infinite;will-change:transform;
}
.zs-ticker:hover .zs-ticker-track,
.zs-ticker:focus-within .zs-ticker-track{animation-play-state:paused}
.zs-ticker-run{display:inline-flex;align-items:center;height:100%;flex:none}
.zs-ticker-item{
  display:inline-flex;align-items:center;gap:.85rem;padding:0 .85rem;height:100%;
  font-family:var(--mono);font-size:.68rem;letter-spacing:.09em;
  text-transform:uppercase;white-space:nowrap;color:#F4EFE3;
}
.zs-ticker-item i{font-style:normal;font-size:.6rem}
.zs-ticker-item:nth-child(4n+1) i,.zs-ticker-item:nth-child(4n+2) i{color:#6FE7D8}
.zs-ticker-item:nth-child(4n+3) i,.zs-ticker-item:nth-child(4n+4) i{color:#C9A6F5}
@keyframes zs-ticker-slide{to{transform:translate3d(-50%,0,0)}}
@media (max-width:899px){
  .zs-ticker{height:34px}
  .zs-ticker-item{font-size:.62rem;padding:0 .7rem;gap:.7rem}
  .zs-ticker-track{animation-duration:74s}
}
@media (min-width:900px) and (max-width:1199px){.zs-ticker-track{animation-duration:60s}}
@media (min-width:1200px){.zs-ticker-track{animation-duration:52s}}

/* ---- nav ---- */
.zs-nav{
  position:sticky;top:0;z-index:60;
  display:flex;align-items:center;gap:2rem;
  padding:.85rem clamp(1.1rem,4vw,3.5rem);
  border-bottom:1px solid var(--line);
  background:color-mix(in srgb,var(--ink) 84%,transparent);
  backdrop-filter:blur(14px);
}
.zs-brand{display:flex;align-items:center;gap:.65rem;margin-right:auto}
.zs-brand-mark{border-radius:11px;border:1px solid var(--line)}
.zs-brand-word{font-family:var(--serif);font-size:1.4rem;letter-spacing:-.01em}
.zs-brand-tld{color:var(--green-lit)}
.zs-nav-links{display:none;gap:1.6rem;font-size:.86rem;color:var(--fg-mute)}
.zs-nav-links a:hover{color:var(--fg)}
.zs-nav-cta{display:flex;align-items:center;gap:.5rem}

/* ---- theme toggle ---- */
.zs-theme-toggle{
  position:relative;display:inline-grid;place-items:center;flex:none;
  width:42px;height:42px;border-radius:999px;padding:0;
  border:1px solid var(--line-2);background:var(--glass);
  backdrop-filter:blur(10px);color:var(--fg);cursor:pointer;
  transition:border-color .22s ease,box-shadow .22s ease,transform .22s ease;
}
.zs-theme-toggle:hover{
  border-color:var(--edge-lit);
  box-shadow:0 0 0 1px var(--edge-lit),0 8px 22px -12px var(--green-lit);
}
.zs-theme-toggle:active{transform:scale(.95)}
.zs-theme-toggle svg{
  grid-area:1/1;width:1.05rem;height:1.05rem;
  transition:opacity .22s ease,transform .22s ease;
}
/* icon state comes from the attribute, not from React — no hydration gap */
.zs-theme-toggle .zs-ticon-sun{opacity:0;transform:rotate(-45deg) scale(.6)}
.zs-theme-toggle .zs-ticon-moon{opacity:1;transform:none}
html[data-theme='light'] .zs-theme-toggle .zs-ticon-sun{opacity:1;transform:none}
html[data-theme='light'] .zs-theme-toggle .zs-ticon-moon{opacity:0;transform:rotate(45deg) scale(.6)}
.zs-sr-only{
  position:absolute;width:1px;height:1px;padding:0;margin:-1px;
  overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;
}

.zs-mnav{position:relative}
.zs-mnav summary{
  list-style:none;cursor:pointer;display:grid;place-items:center;
  width:2.4rem;height:2.4rem;border-radius:10px;border:1px solid var(--line);
}
.zs-mnav summary::-webkit-details-marker{display:none}
.zs-burger{width:1rem;height:2px;background:var(--fg);position:relative;display:block}
.zs-burger::before,.zs-burger::after{content:'';position:absolute;left:0;width:1rem;height:2px;background:var(--fg)}
.zs-burger::before{top:-5px}
.zs-burger::after{top:5px}
.zs-mnav-panel{
  position:absolute;right:0;top:3rem;min-width:13rem;
  display:flex;flex-direction:column;gap:.15rem;
  background:var(--ink-2);border:1px solid var(--line);border-radius:14px;
  padding:.6rem;box-shadow:var(--shadow-lg);
}
.zs-mnav-panel a{padding:.6rem .7rem;border-radius:9px;font-size:.9rem;color:var(--fg-mute)}
.zs-mnav-panel a:hover{background:var(--ink-3);color:var(--fg)}

/* ---- buttons ---- */
.zs-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
  padding:.6rem 1.05rem;border-radius:999px;
  font-size:.875rem;font-weight:600;line-height:1;
  border:1px solid transparent;transition:.22s ease;white-space:nowrap;
}
.zs-btn-lg{padding:.9rem 1.5rem;font-size:.95rem}
.zs-btn-full{width:100%}
.zs-ico{width:1rem;height:1rem}
.zs-btn-ghost{color:var(--fg-mute)}
.zs-btn-ghost:hover{color:var(--fg)}
.zs-btn-solid{background:var(--paper);color:#0B1210!important;opacity:1!important}
.zs-btn-solid span,.zs-btn-solid svg{color:#0B1210!important;opacity:1!important}
.zs-btn-solid:hover{background:#fff;transform:translateY(-1px)}
html[data-theme='light'] .zs-btn-solid{background:#0B1210;color:#FFFFFF!important}
html[data-theme='light'] .zs-btn-solid span,
html[data-theme='light'] .zs-btn-solid svg{color:#FFFFFF!important}
html[data-theme='light'] .zs-btn-solid:hover{background:#1A2420}
/* dimming happens only on a real disabled state, never by default */
.zs-btn-solid:disabled,.zs-btn-solid[aria-disabled='true']{
  opacity:.55!important;cursor:not-allowed;transform:none;
}
.zs-btn-outline{border-color:var(--line-2);color:var(--fg)}
.zs-btn-outline:hover{border-color:var(--green-lit);color:var(--green-lit)}
.zs-btn-wa{background:var(--wa);color:#06281A}
.zs-btn-wa:hover{filter:brightness(1.08);transform:translateY(-1px)}

/* ---- hero ---- */
.zs-hero{
  position:relative;display:grid;gap:clamp(3rem,7vw,5rem);
  max-width:1240px;margin:0 auto;
  padding:clamp(3rem,8vw,5.5rem) clamp(1.1rem,4vw,3.5rem) clamp(3rem,7vw,4.5rem);
}
.zs-hero::before{
  content:'';position:absolute;inset:-10% 40% 40% -20%;
  background:radial-gradient(closest-side,var(--glow),transparent);
  filter:blur(30px);pointer-events:none;
}
.zs-hero-copy{position:relative;max-width:34rem}
.zs-eyebrow{
  display:inline-flex;align-items:center;gap:.55rem;
  font-family:var(--mono);font-size:.72rem;letter-spacing:.14em;
  text-transform:uppercase;color:var(--brass);
  border:1px solid var(--edge-brass);border-radius:999px;
  padding:.4rem .8rem;margin-bottom:1.5rem;
}
.zs-dot{width:.4rem;height:.4rem;border-radius:999px;background:var(--brass)}
.zs-h1{font-family:var(--serif);font-weight:400;font-size:clamp(2.7rem,7.2vw,4.6rem);line-height:1.02;letter-spacing:-.02em}
.zs-h1 em{font-style:italic;color:var(--green-lit)}
.zs-lede{margin-top:1.4rem;max-width:31rem;font-size:clamp(1rem,1.5vw,1.075rem);line-height:1.65;color:var(--fg-mute)}
.zs-actions{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:2rem}
.zs-actions-center{justify-content:center}
.zs-assure{display:flex;flex-wrap:wrap;gap:.4rem 1.3rem;list-style:none;padding:0;margin:1.9rem 0 0;font-size:.8rem;color:var(--fg-mute)}
.zs-assure li{display:flex;align-items:center;gap:.4rem}
.zs-tick{width:.85rem;height:.85rem;color:var(--green-lit)}

/* ---- the sheet ---- */
.zs-sheet-stage{position:relative;padding-bottom:1.5rem}
.zs-sheet-back{
  position:absolute;inset:1.6rem -.9rem -1rem 1.9rem;
  background:var(--paper-2);border-radius:4px;transform:rotate(2.4deg);
  box-shadow:var(--shadow-lg);
}
.zs-sheet-tab{position:absolute;top:.7rem;right:1rem;font-family:var(--mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:#8B8168}
.zs-sheet{
  position:relative;background:var(--paper);color:#1A1F1C;
  border-radius:4px;padding:1.35rem 1.4rem 1rem;transform:rotate(-1.1deg);
  box-shadow:var(--shadow-sheet);
  background-image:linear-gradient(rgba(0,0,0,.018) 1px,transparent 1px);
  background-size:100% 1.55rem;
  transition:transform .5s cubic-bezier(.2,.7,.2,1);
}
.zs-sheet-stage:hover .zs-sheet{transform:rotate(0deg) translateY(-6px)}
/* the sheet never inherits the page foreground, in either theme */
.zs-sheet,.zs-sheet h2,.zs-sheet strong,.zs-sheet b{color:#1A1F1C}
.zs-sheet-head{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}
.zs-sheet-board{font-family:var(--mono);font-size:.56rem;letter-spacing:.16em;text-transform:uppercase;color:#7C7460;margin-bottom:.35rem}
.zs-sheet-title{font-family:var(--serif);font-size:1.5rem;line-height:1}
.zs-sheet-meta{font-size:.7rem;color:#6E6857;margin-top:.3rem}
.zs-rollbox{text-align:right}
.zs-rollbox span{font-family:var(--mono);font-size:.54rem;letter-spacing:.12em;text-transform:uppercase;color:#7C7460}
.zs-rollcells{display:flex;gap:2px;margin-top:.3rem}
.zs-rollcells i{width:.85rem;height:1.05rem;border:1px solid var(--paper-rule);display:block}
.zs-sheet-rule{
  display:flex;justify-content:space-between;margin:.9rem 0 .75rem;padding:.4rem 0;
  border-top:1px solid var(--paper-rule);border-bottom:1px solid var(--paper-rule);
  font-family:var(--mono);font-size:.62rem;letter-spacing:.06em;color:#5E5849;
}
.zs-sheet-body{display:flex;gap:.9rem}
.zs-marks{
  display:flex;flex-direction:column;gap:2.4rem;padding-right:.85rem;padding-top:1.3rem;
  border-right:1px dashed var(--paper-rule);
  font-family:var(--mono);font-size:.66rem;color:var(--red);
}
.zs-questions{flex:1;min-width:0}
.zs-section{font-family:var(--mono);font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:var(--green);margin-bottom:.5rem;padding-top:.35rem}
.zs-section:not(:first-child){margin-top:1.05rem;border-top:1px dotted var(--paper-rule)}
.zs-q{font-size:.8rem;margin-bottom:.35rem}
.zs-sub{font-size:.76rem;line-height:1.5;color:#3A3F3A;margin-bottom:.3rem;display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.zs-opts{display:inline-flex;gap:.3rem;margin-left:auto}
.zs-opts span{width:1.05rem;height:1.05rem;border:1px solid var(--paper-rule);border-radius:999px;font-family:var(--mono);font-size:.55rem;display:grid;place-items:center;color:#7C7460}
.zs-opt-on{background:var(--red);border-color:var(--red)!important;color:#FBF7EC!important}
.zs-urdu{font-family:var(--urdu);font-size:.85rem;line-height:2.1;direction:rtl;display:block;color:#2E332F}
.zs-writing{color:#6E6857}
.zs-caret{display:inline-block;width:.5rem;height:.85rem;background:var(--green);margin-left:.15rem;animation:zs-blink 1.05s steps(1) infinite}
@keyframes zs-blink{50%{opacity:0}}
.zs-sheet-foot{display:flex;flex-wrap:wrap;gap:.5rem .9rem;margin-top:1rem;padding-top:.55rem;border-top:1px solid var(--paper-rule)}
.zs-mono{font-family:var(--mono);font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-mute)}
.zs-sheet .zs-mono,.zs-sheet-foot .zs-mono{color:#7C7460}
.zs-chip{
  position:absolute;left:-.4rem;bottom:-.4rem;display:inline-flex;align-items:center;gap:.5rem;
  background:var(--ink-3);border:1px solid var(--line);border-radius:999px;padding:.5rem .9rem;
  font-family:var(--mono);font-size:.66rem;letter-spacing:.06em;color:var(--fg);
  box-shadow:var(--shadow-md);
}
.zs-chip-pulse{width:.42rem;height:.42rem;border-radius:999px;background:var(--green-lit);box-shadow:0 0 0 0 var(--pulse);animation:zs-pulse 1.8s ease-out infinite}
@keyframes zs-pulse{70%{box-shadow:0 0 0 .5rem transparent}100%{box-shadow:0 0 0 0 transparent}}

/* ---- facts ---- */
.zs-facts{
  display:grid;grid-template-columns:repeat(2,1fr);gap:1px;
  background:var(--line);border-top:1px solid var(--line);border-bottom:1px solid var(--line);
}
.zs-facts > div{background:var(--ink);padding:1.6rem 1.2rem;display:grid;gap:.35rem;justify-items:center;text-align:center}
.zs-fact-v{font-family:var(--serif);font-size:clamp(1.8rem,4vw,2.5rem);line-height:1;color:var(--green-lit)}
.zs-fact-l{font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute)}

/* ---- marquee ---- */
.zs-marquee{overflow:hidden;padding:.9rem 0;background:var(--ink-2);border-bottom:1px solid var(--line)}
.zs-marquee-track{display:flex;gap:2.5rem;width:max-content;animation:zs-slide 46s linear infinite}
.zs-marquee-item{display:inline-flex;align-items:center;gap:2.5rem;font-family:var(--mono);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);white-space:nowrap}
.zs-marquee-item i{color:var(--green);font-size:.5rem;font-style:normal}
@keyframes zs-slide{to{transform:translate3d(-50%,0,0)}}

/* ---- bands ---- */
.zs-band{max-width:1180px;margin:0 auto;padding:clamp(3.5rem,8vw,6rem) clamp(1.1rem,4vw,3.5rem)}
.zs-band-alt{max-width:none;background:var(--ink-2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.zs-band-alt > *{max-width:1180px;margin-left:auto;margin-right:auto}
.zs-band-head{max-width:40rem;margin-bottom:clamp(2.2rem,5vw,3.2rem)}
.zs-label{font-family:var(--mono);font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--brass);margin-bottom:.9rem}
.zs-h2{font-family:var(--serif);font-weight:400;font-size:clamp(1.9rem,4.2vw,3rem);line-height:1.08;letter-spacing:-.02em}
.zs-h2 em{font-style:italic;color:var(--green-lit)}
.zs-band-sub{margin-top:1rem;font-size:.98rem;line-height:1.65;color:var(--fg-mute);max-width:34rem}

/* ---- steps ---- */
.zs-steps{list-style:none;padding:0;margin:0;display:grid;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.zs-step{background:var(--ink);padding:1.8rem 1.6rem}
.zs-step-top{display:flex;align-items:center;justify-content:space-between;color:var(--green-lit)}
.zs-step-top svg{width:1.3rem;height:1.3rem}
.zs-step-n{font-family:var(--mono);font-size:.72rem;letter-spacing:.16em;color:var(--fg-mute)}
.zs-step h3{font-family:var(--serif);font-size:1.35rem;font-weight:400;margin:1rem 0 .5rem}
.zs-step p{font-size:.88rem;line-height:1.6;color:var(--fg-mute)}

/* ---- curriculum ---- */
.zs-curric{display:grid;gap:1rem}
.zs-cur{position:relative;background:var(--ink);border:1px solid var(--line);border-radius:16px;padding:1.5rem 1.4rem;transition:.25s ease}
.zs-cur:hover{border-color:var(--edge-lit);transform:translateY(-3px)}
.zs-cur h3{font-family:var(--serif);font-size:1.7rem;font-weight:400;margin:.4rem 0 .35rem}
.zs-cur-ch{font-size:.86rem;color:var(--fg-mute)}
.zs-cur-note{margin-top:.9rem;font-size:.75rem;line-height:1.5;color:var(--brass);border-left:2px solid var(--edge-brass);padding-left:.7rem}
.zs-cur-live{display:inline-flex;align-items:center;gap:.4rem;margin-top:1.1rem;font-family:var(--mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--green-lit)}
.zs-live{width:.45rem;height:.45rem;border-radius:999px;background:var(--green-lit);box-shadow:0 0 0 0 var(--pulse);animation:zs-pulse 1.8s ease-out infinite;flex:none}

/* ---- classes ---- */
.zs-classes{display:grid;grid-template-columns:repeat(2,1fr);gap:.8rem}
.zs-class{
  position:relative;display:grid;gap:.3rem;justify-items:center;text-align:center;
  padding:1.4rem .8rem;border:1px solid var(--line);border-radius:14px;
  background:var(--ink-2);transition:.25s ease;
}
.zs-class:hover{transform:translateY(-3px);border-color:var(--line-2)}
.zs-class-live{border-color:var(--edge-lit)}
.zs-class-live:hover{border-color:var(--green-lit)}
.zs-class-n{font-family:var(--serif);font-size:1.8rem;line-height:1}
.zs-class-s{font-size:.72rem;color:var(--fg-mute)}
.zs-class-tag{font-family:var(--mono);font-size:.55rem;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-mute);margin-top:.35rem}
.zs-class-live .zs-class-tag{color:var(--green-lit)}

/* ---- feature cards ---- */
.zs-grid{display:grid;gap:1rem}
.zs-card{background:var(--ink);border:1px solid var(--line);border-radius:16px;padding:1.6rem 1.5rem;transition:.28s ease}
.zs-card:hover{border-color:var(--edge-lit);transform:translateY(-3px)}
.zs-card-ico{width:1.35rem;height:1.35rem;color:var(--green-lit);margin-bottom:1rem}
.zs-card h3{font-size:1rem;font-weight:600;margin-bottom:.5rem;letter-spacing:-.01em}
.zs-card p{font-size:.88rem;line-height:1.6;color:var(--fg-mute)}

/* ---- panels ---- */
.zs-two{display:grid;gap:1.1rem;align-items:start}
.zs-panel{background:var(--ink-2);border:1px solid var(--line);border-radius:18px;padding:1.5rem 1.4rem}
.zs-band-alt .zs-panel{background:var(--ink)}
.zs-panel-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.6rem;padding-bottom:.9rem;margin-bottom:1.1rem;border-bottom:1px solid var(--line)}
.zs-panel-title{display:inline-flex;align-items:center;gap:.55rem;font-size:.95rem;font-weight:600}
.zs-panel-title svg{width:1.05rem;height:1.05rem;color:var(--green-lit)}

.zs-skel-wrap{display:grid;gap:.6rem}
.zs-skel{display:block;height:3.2rem;border-radius:12px;background:var(--line);animation:zs-fade 1.4s ease-in-out infinite}
@keyframes zs-fade{50%{opacity:.4}}
.zs-empty{display:flex;align-items:center;gap:.6rem;font-size:.86rem;line-height:1.6;color:var(--fg-mute);padding:1.2rem 0}
.zs-empty svg{width:1rem;height:1rem;flex:none}

.zs-news-list,.zs-ds-list{list-style:none;padding:0;margin:0;display:grid;gap:.4rem}
.zs-news-list a,.zs-ds-list a{display:flex;align-items:center;gap:.8rem;padding:.8rem;border-radius:12px;border:1px solid transparent;transition:.22s ease}
.zs-news-list a:hover,.zs-ds-list a:hover{background:var(--ink-3);border-color:var(--line)}
.zs-news-list a > svg,.zs-ds-list a > svg{width:1rem;height:1rem;color:var(--fg-mute);flex:none;margin-left:auto}
.zs-ds-list a > svg:first-child{margin-left:0;color:var(--green-lit)}
.zs-news-body,.zs-ds-list a > span{display:grid;gap:.2rem;min-width:0}
.zs-news-body strong,.zs-ds-list strong{font-size:.85rem;font-weight:600;line-height:1.4}
.zs-news-body em,.zs-ds-list em{font-style:normal;font-family:var(--mono);font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-mute)}
.zs-flag{flex:none;width:2.4rem;font-family:var(--mono);font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;color:var(--fg-mute)}
.zs-flag-hot{color:var(--brass)}

/* ---- pricing ---- */
.zs-price{display:grid;gap:1.2rem;align-items:stretch}
.zs-plan{position:relative;background:var(--ink);border:1px solid var(--line);border-radius:20px;padding:2rem 1.8rem;display:flex;flex-direction:column}
.zs-plan-featured{border-color:var(--edge-lit);box-shadow:var(--shadow-lg)}
.zs-plan-badge{
  position:absolute;top:-.7rem;left:1.8rem;background:var(--green-lit);color:var(--on-accent);
  font-family:var(--mono);font-size:.56rem;letter-spacing:.14em;text-transform:uppercase;
  padding:.35rem .7rem;border-radius:999px;
}
.zs-plan h3{font-family:var(--serif);font-size:1.9rem;font-weight:400}
.zs-plan-for{font-size:.86rem;color:var(--fg-mute);margin-top:.3rem}
.zs-plan-price{display:flex;align-items:baseline;gap:.45rem;margin:1.4rem 0 1.5rem;flex-wrap:wrap}
.zs-plan-cur{font-family:var(--mono);font-size:.7rem;letter-spacing:.12em;color:var(--fg-mute)}
.zs-plan-num{font-family:var(--serif);font-size:3.2rem;line-height:1}
.zs-plan-per{font-size:.8rem;color:var(--fg-mute)}
.zs-plan ul{list-style:none;padding:0;margin:0 0 1.8rem;display:grid;gap:.6rem;flex:1}
.zs-plan li{display:flex;align-items:flex-start;gap:.55rem;font-size:.87rem;line-height:1.5;color:var(--fg-mute)}
.zs-plan li svg{width:.9rem;height:.9rem;color:var(--green-lit);flex:none;margin-top:.2rem}
.zs-price-note{display:flex;align-items:center;justify-content:center;gap:.55rem;margin-top:1.6rem;font-size:.82rem;color:var(--fg-mute);text-align:center}
.zs-price-note svg{width:.95rem;height:.95rem;color:var(--brass);flex:none}

/* ---- portals ---- */
.zs-portals{display:grid;gap:1.1rem}
.zs-portal{position:relative;display:block;border:1px solid var(--line);border-radius:20px;padding:2rem 1.8rem;background:var(--ink-2);overflow:hidden;transition:.3s cubic-bezier(.2,.7,.2,1)}
.zs-portal::after{
  content:'';position:absolute;left:0;right:0;top:0;height:2px;
  background:linear-gradient(90deg,var(--green),var(--green-lit),var(--brass));
  transform:scaleX(0);transform-origin:left;transition:transform .4s ease;
}
.zs-portal:hover{transform:translateY(-4px);border-color:var(--edge-lit)}
.zs-portal:hover::after{transform:scaleX(1)}
.zs-portal-ico{display:grid;place-items:center;width:2.9rem;height:2.9rem;border-radius:14px;border:1px solid var(--line);background:var(--ink-3);color:var(--green-lit);margin-bottom:1.2rem}
.zs-portal-ico svg{width:1.35rem;height:1.35rem}
.zs-portal h3{font-family:var(--serif);font-size:1.65rem;font-weight:400;margin-bottom:.55rem}
.zs-portal > p{margin-bottom:1.2rem;font-size:.92rem;line-height:1.6;color:var(--fg-mute);max-width:26rem}
.zs-portal ul{list-style:none;padding:0;margin:0 0 1.4rem;display:flex;flex-wrap:wrap;gap:.4rem .9rem}
.zs-portal li{display:flex;align-items:center;gap:.35rem;font-size:.78rem;color:var(--fg-mute)}
.zs-portal li svg{width:.8rem;height:.8rem;color:var(--green-lit)}
.zs-portal-go{display:inline-flex;align-items:center;gap:.4rem;font-size:.85rem;font-weight:600}
.zs-portal-go svg{width:.95rem;height:.95rem;transition:transform .25s ease}
.zs-portal:hover .zs-portal-go svg{transform:translateX(3px)}

/* ---- founder / contact ---- */
.zs-founder{display:flex;align-items:center;gap:1rem;padding-bottom:1.3rem;margin-bottom:1.3rem;border-bottom:1px solid var(--line)}
.zs-founder-face{
  display:grid;place-items:center;width:3.4rem;height:3.4rem;flex:none;border-radius:16px;
  background:linear-gradient(135deg,var(--green),var(--green-lit));color:var(--on-accent);
  font-family:var(--serif);font-size:1.7rem;
}
.zs-founder h3{font-family:var(--serif);font-size:1.5rem;font-weight:400}
.zs-founder-loc{display:flex;align-items:center;gap:.35rem;font-size:.75rem;color:var(--fg-mute);margin-top:.35rem}
.zs-founder-loc svg{width:.8rem;height:.8rem}
.zs-vision-p{font-size:.92rem;line-height:1.75;color:var(--fg-mute)}
.zs-vision-p + .zs-vision-p{margin-top:.95rem}
.zs-vision-p:first-of-type{color:var(--fg)}
.zs-contact-col{display:grid;gap:1.1rem;align-content:start}
.zs-mission-line{margin-top:.5rem;font-family:var(--serif);font-size:1.2rem;line-height:1.55;color:var(--fg)}
.zs-contact{list-style:none;padding:0;margin:0 0 1.3rem;display:grid;gap:.7rem}
.zs-contact li{display:flex;align-items:center;gap:.8rem}
.zs-contact li > svg{width:1rem;height:1rem;color:var(--green-lit);flex:none}
.zs-contact span{display:grid;gap:.15rem;min-width:0}
.zs-contact strong{font-size:.88rem;font-weight:600;word-break:break-word}
.zs-contact em{font-style:normal;font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-mute)}

/* ---- faq ---- */
.zs-faq{display:grid;gap:.6rem;max-width:52rem}
.zs-faq details{background:var(--ink-2);border:1px solid var(--line);border-radius:14px;padding:1.1rem 1.3rem;transition:.22s ease}
.zs-faq details[open]{border-color:var(--edge-lit)}
.zs-faq summary{display:flex;align-items:center;justify-content:space-between;gap:1.2rem;cursor:pointer;list-style:none;font-size:.98rem;font-weight:600}
.zs-faq summary::-webkit-details-marker{display:none}
.zs-faq summary i{
  flex:none;display:grid;place-items:center;width:1.6rem;height:1.6rem;border-radius:999px;
  border:1px solid var(--line-2);font-style:normal;font-size:1rem;color:var(--fg-mute);
  transition:transform .25s ease,color .25s ease;
}
.zs-faq details[open] summary i{transform:rotate(45deg);color:var(--green-lit)}
.zs-faq p{margin-top:.9rem;font-size:.9rem;line-height:1.7;color:var(--fg-mute);max-width:44rem}

/* ---- close ---- */
.zs-close{max-width:1180px;margin:0 auto;padding:clamp(4rem,9vw,7rem) clamp(1.1rem,4vw,3.5rem);text-align:center;border-top:1px solid var(--line)}
.zs-close > p{max-width:34rem;margin:1.2rem auto 0;color:var(--fg-mute);line-height:1.65}

/* ---- footer ---- */
.zs-foot{border-top:1px solid var(--line);background:var(--ink-2);padding:3rem clamp(1.1rem,4vw,3.5rem) 1.6rem}
.zs-foot-grid{max-width:1180px;margin:0 auto;display:grid;gap:2.2rem}
.zs-foot-grid > div{display:flex;flex-direction:column;gap:.65rem;align-items:flex-start}
.zs-foot-about p{font-size:.86rem;line-height:1.6;color:var(--fg-mute);max-width:24rem;margin-top:.4rem}
.zs-foot-about .zs-brand{margin-right:0}
.zs-foot-h{font-family:var(--mono);font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:var(--fg);margin-bottom:.2rem}
.zs-foot-grid a{font-size:.86rem;color:var(--fg-mute)}
.zs-foot-grid a:hover{color:var(--green-lit)}
.zs-foot-base{
  max-width:1180px;margin:2.4rem auto 0;padding-top:1.4rem;border-top:1px solid var(--line);
  display:flex;flex-wrap:wrap;gap:.6rem;justify-content:space-between;
}
.zs-foot-copy{font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-mute)}

/* ---- floating whatsapp ---- */
.zs-wa{
  position:fixed;right:1.1rem;bottom:1.1rem;z-index:70;
  display:inline-flex;align-items:center;gap:.55rem;
  padding:.85rem 1.1rem;border-radius:999px;background:var(--wa);color:#06281A;
  font-size:.85rem;font-weight:700;box-shadow:var(--shadow-md);
  opacity:0;transform:translateY(14px);pointer-events:none;
  transition:opacity .5s ease,transform .5s ease,filter .2s ease;
}
.zs-wa-in{opacity:1;transform:none;pointer-events:auto}
.zs-wa:hover{filter:brightness(1.08)}
.zs-wa svg{width:1.15rem;height:1.15rem}
.zs-wa-label{display:none}

/* ---- entrance ---- */
.zs-in{animation:zs-rise .75s cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--d,0ms)}
@keyframes zs-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@supports (animation-timeline:view()){
  .zs-reveal{animation:zs-rise linear both;animation-timeline:view();animation-range:entry 5% cover 26%}
}

/* ---- responsive ---- */
@media (max-width:479px){
  .zs-nav{gap:.85rem}
  .zs-nav-cta .zs-btn-ghost{display:none}
  .zs-theme-toggle{width:38px;height:38px}
  .zs-btn{padding:.55rem .85rem;font-size:.82rem}
}
@media (min-width:520px){
  .zs-wa-label{display:inline}
  .zs-classes{grid-template-columns:repeat(4,1fr)}
}
@media (min-width:640px){
  .zs-grid{grid-template-columns:repeat(2,1fr)}
  .zs-curric{grid-template-columns:repeat(2,1fr)}
  .zs-facts{grid-template-columns:repeat(4,1fr)}
  .zs-price{grid-template-columns:repeat(2,1fr)}
  .zs-foot-grid{grid-template-columns:repeat(2,1fr)}
}
@media (min-width:900px){
  .zs-nav-links{display:flex}
  .zs-mnav{display:none}
  .zs-hero{grid-template-columns:1.05fr .95fr;align-items:center}
  .zs-steps{grid-template-columns:repeat(4,1fr)}
  .zs-grid{grid-template-columns:repeat(4,1fr)}
  .zs-curric{grid-template-columns:repeat(4,1fr)}
  .zs-classes{grid-template-columns:repeat(8,1fr)}
  .zs-portals{grid-template-columns:repeat(2,1fr)}
  .zs-two{grid-template-columns:1fr 1fr}
  .zs-two-wide{grid-template-columns:1.25fr .75fr}
  .zs-foot-grid{grid-template-columns:1.6fr 1fr 1fr 1fr}
}

@media (prefers-reduced-motion:reduce){
  .zs *:not(.zs-ticker-track),.zs *::before,.zs *::after{animation:none!important;transition:none!important}
  .zs-in,.zs-reveal{opacity:1;transform:none}
  .zs-wa{opacity:1;transform:none;pointer-events:auto}
}

/* ============================================================
   CENTRED NAV PILL — emerald ellipse, links in the middle
   ============================================================ */
.zs-nav{
  display:grid;
  grid-template-columns:1fr auto 1fr;
  align-items:center;
  gap:1rem;
  padding:.75rem clamp(1.1rem,4vw,3.5rem);
}
.zs-nav > *{min-width:0}
.zs-brand{margin-right:0;justify-self:start}
.zs-nav-cta{justify-self:end}

.zs-nav-links{
  display:none;
  align-items:center;
  gap:.15rem;
  justify-self:center;
  padding:.3rem;
  border-radius:999px;
  background:color-mix(in srgb,var(--green) 88%,#000);
  border:1px solid color-mix(in srgb,#fff 16%,transparent);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb,#fff 24%,transparent),
    0 12px 28px -18px var(--green);
}
.zs-nav-links a{
  display:inline-flex;
  align-items:center;
  white-space:nowrap;
  padding:.55rem 1.05rem;
  border-radius:999px;
  font-size:.85rem;
  font-weight:500;
  color:rgba(255,255,255,.85);
  transition:background-color .2s ease,color .2s ease;
}
.zs-nav-links a:hover{
  background:rgba(255,255,255,.16);
  color:#fff;
}
.zs-nav-links a:focus-visible{
  outline:2px solid #fff;
  outline-offset:-2px;
}

@media (min-width:900px){
  .zs-nav-links{display:inline-flex}
}
@media (min-width:900px) and (max-width:1099px){
  .zs-nav-links a{padding:.5rem .8rem;font-size:.8rem}
}

/* ==================================================================
   ELITE PASS — execution polish.
   This block is LAST in the stylesheet, so it wins over everything
   above it. Every rule below is either a correction of a real defect
   or a tightening of an existing decision. Nothing new is invented.
   ================================================================== */

/* --- 1. TYPE ------------------------------------------------------
   The headline was set at 4.6rem inside a 34rem column, so a 19-character
   line had nowhere to go and broke into four ragged lines. Cap the size,
   widen the column, and let the browser balance the break points.       */
.zs-h1,.zs-h2{text-wrap:balance}
.zs-lede,.zs-band-sub,.zs-card p,.zs-step p{text-wrap:pretty}
.zs-h1{
  font-size:clamp(2.55rem,5.4vw,3.75rem);
  line-height:1.04;
  letter-spacing:-.026em;
}
@media (min-width:1200px){
  .zs-hero-copy{max-width:36rem}
  .zs-lede{font-size:1.08rem;max-width:30rem;margin-top:1.55rem}
}
.zs ::selection{background:color-mix(in srgb,var(--green-lit) 32%,transparent)}

/* --- 2. LIGHT THEME ----------------------------------------------
   The old light canvas was #F4F7F5 and the sheet was #FFFDF7 — a two
   percent difference. The signature element vanished. Push the canvas
   down and give the sheet a real edge so it reads as a physical object. */
html[data-theme='light'] .zs{
  --ink:#EDF2EF;
  --ink-2:#FFFFFF;
  --ink-3:#E1E9E5;
  --line:rgba(12,32,26,.13);
  --line-2:rgba(12,32,26,.24);
  --fg:#0C201A;
  --fg-mute:#4C5C56;
}
html[data-theme='light'] .zs-sheet{
  box-shadow:0 36px 78px -24px rgba(8,60,44,.32),0 0 0 1px rgba(12,32,26,.10);
}
html[data-theme='light'] .zs-sheet-back{
  background:#E7DECA;
  box-shadow:0 22px 50px -20px rgba(8,60,44,.26);
}
html[data-theme='light'] .zs-chip{background:#FFFFFF}

/* --- 3. THE SHEET -------------------------------------------------
   The "Answer key" tab sat outside the back sheet's bounds, so on wide
   screens only a stray "Y" showed. Clip it, then give the whole stage
   more room to breathe.                                                */
.zs-sheet-back{overflow:hidden}
.zs-sheet-tab{top:.65rem;right:1.5rem}
.zs-sheet-stage{padding-bottom:2rem}
.zs-sheet{padding:1.5rem 1.55rem 1.15rem}
@media (min-width:1200px){
  .zs-sheet{padding:1.8rem 1.9rem 1.35rem}
  .zs-sheet-title{font-size:1.7rem}
}

/* --- 4. HERO RHYTHM ----------------------------------------------- */
@media (min-width:1200px){
  .zs-hero{gap:clamp(2.5rem,4.5vw,4rem);align-items:center}
}
.zs-eyebrow{padding:.42rem .85rem;margin-bottom:1.6rem}

/* --- 5. PROCESS BAND ----------------------------------------------
   These four steps are a real sequence, so the numbering earns its
   place. Style it as the marks column in the sheet's margin — the same
   red mono figure a board paper puts beside every question.            */
.zs-step{padding:2rem 1.7rem}
.zs-step-n{
  color:var(--red);
  font-weight:500;
  padding-left:.75rem;
  border-left:1px dashed var(--line-2);
}
html[data-theme='light'] .zs-step-n{color:#A33421}

/* --- 6. SURFACES --------------------------------------------------
   One radius family, and a calmer lift so eight cards hovering do not
   feel like a trampoline.                                              */
.zs-card,.zs-cur,.zs-panel,.zs-faq details{border-radius:18px}
.zs-plan,.zs-portal{border-radius:22px}
.zs-card:hover,.zs-cur:hover{transform:translateY(-2px)}
.zs-portal:hover{transform:translateY(-3px)}
.zs-class:hover{transform:translateY(-2px)}

/* --- 7. PRICING ---------------------------------------------------
   If one plan is recommended, it should look recommended.              */
.zs-plan-featured{
  background:linear-gradient(180deg,color-mix(in srgb,var(--green) 10%,var(--ink)) 0%,var(--ink) 40%);
}
@media (min-width:900px){
  .zs-plan-featured{transform:translateY(-.7rem)}
}

/* --- 8. FACTS ----------------------------------------------------- */
.zs-facts > div{padding:1.9rem 1.2rem;gap:.5rem}
.zs-fact-v{font-size:clamp(2rem,4.2vw,2.75rem)}

/* --- 9. CONTROLS --------------------------------------------------
   A press state, so buttons feel connected to the click.               */
.zs-btn:active{transform:translateY(0) scale(.985)}
.zs-btn-lg{padding:.92rem 1.6rem}

/* --- 10. FOOTER --------------------------------------------------- */
.zs-foot{padding-top:3.6rem}
.zs-foot-base{margin-top:2.8rem}

/* --- 11. THIRD-PARTY CHAT WIDGET ----------------------------------
   A "Message us" bubble from an external script sits in the same corner
   as the WhatsApp button and the two overlap. This lifts ours clear.
   If you remove that widget, delete this block.                        */
@media (min-width:520px){
  .zs-wa{bottom:5.6rem}
}

/* ==================================================================
   ELITE PASS 2 — entrance moment, highlighter motif, live motion on
   the sheet, a verification badge, and two progressive-enhancement
   scroll effects. Everything below is CSS-only: no new client
   component, no new dependency. Where a browser does not support a
   technique, it is guarded by @supports and the page just stays
   static there — nothing breaks.
   ================================================================== */

/* --- 12. WELCOME ENTRANCE -------------------------------------------
   Mark and text settle in over the first second, then HOLD fully
   visible with ambient motion (glow pulse + a slow logo "breathe") for
   about 2.2s more, then fade — ~3.9s on screen end to end, blocking
   clicks the whole time it's visible (default pointer-events, not
   none) so nothing gets clicked through by accident, then releasing
   automatically once visibility:hidden lands.                         */
.zs-welcome{
  position:fixed;inset:0;z-index:90;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:1.5rem;background:var(--ink);
  animation:zs-welcome-out .7s ease forwards;
  animation-delay:3.2s;
}
.zs-welcome-glow{
  position:absolute;top:50%;left:50%;
  width:24rem;height:24rem;margin:-12rem 0 0 -12rem;
  border-radius:50%;
  background:radial-gradient(closest-side,var(--glow),transparent 70%);
  animation:zs-welcome-glow-pulse 2.6s ease-in-out .3s infinite;
}
.zs-welcome-mark{
  position:relative;width:6.5rem;height:6.5rem;
  animation:
    zs-welcome-mark-in .8s cubic-bezier(.2,.7,.2,1) both,
    zs-welcome-mark-breathe 2.8s ease-in-out 1s infinite;
}
.zs-welcome-mark img{width:100%;height:100%;object-fit:contain;position:relative;z-index:1}
.zs-welcome-text{
  position:relative;
  font-family:var(--serif);font-style:italic;font-weight:400;
  font-size:clamp(2rem,6vw,3.4rem);color:var(--fg);text-align:center;
  opacity:0;animation:zs-welcome-text-in .8s cubic-bezier(.2,.7,.2,1) .5s both;
}
@keyframes zs-welcome-mark-in{from{opacity:0;transform:scale(.6) rotate(-6deg)}to{opacity:1;transform:scale(1) rotate(0)}}
@keyframes zs-welcome-mark-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}
@keyframes zs-welcome-glow-pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.9;transform:scale(1.12)}}
@keyframes zs-welcome-text-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes zs-welcome-out{to{opacity:0;visibility:hidden}}
@media (prefers-reduced-motion:reduce){
  .zs-welcome{display:none}
}

/* --- 13. HIGHLIGHTER MOTIF -------------------------------------------
   A marker-pen stroke behind the text, not a flat highlight box — the
   same gesture a student makes in their own notes. Used sparingly.    */
.zs-hl{position:relative;padding:0 .16em;white-space:nowrap}
.zs-hl::before{
  content:'';position:absolute;z-index:-1;
  left:-.1em;right:-.1em;top:.34em;bottom:0;
  background:color-mix(in srgb,var(--brass) 55%,transparent);
  border-radius:.2em .5em .25em .4em/.35em .2em .5em .2em;
  transform:rotate(-.7deg);
}
html[data-theme='light'] .zs-hl::before{
  background:color-mix(in srgb,var(--brass) 40%,transparent);
}

/* --- 14. THE SHEET, LIVE ---------------------------------------------
   The marked answer gets a quiet confirming pulse rather than cycling
   between options — a correct answer does not change, so only the
   process status (which section is being built) cycles.               */
@keyframes zs-opt-pulse{
  0%,70%,100%{box-shadow:0 0 0 0 transparent}
  82%{box-shadow:0 0 0 .28rem color-mix(in srgb,var(--red) 30%,transparent)}
}
.zs-opt-on{animation:zs-opt-pulse 4.5s ease-in-out infinite}
.zs-chip-status::before{
  content:"Assembling section A";
  animation:zs-chip-cycle 6s steps(1) infinite;
}
@keyframes zs-chip-cycle{
  0%,30%{content:"Assembling section A"}
  33%,63%{content:"Assembling section B"}
  66%,100%{content:"Assembling section C"}
}

/* --- 15. QR VERIFICATION BADGE ---------------------------------------
   Every generated paper really does carry a verification QR — this
   surfaces that real feature on the sample sheet. The glyph itself is
   illustrative (it is a sample sheet, not a specific real paper), the
   claim in the tooltip is not.                                        */
.zs-verify{display:inline-flex!important;align-items:center;gap:.35rem;cursor:help}
.zs-verify-icon{width:.9rem;height:.9rem;color:#087A55;flex:none}

/* --- 16. VERSION A / B SHUFFLE ---------------------------------------
   Lives inside its own feature card only — three bars trading places,
   a small visual proof that the row order really changes.             */
.zs-shuffle{display:flex;flex-direction:column;gap:.32rem;margin-top:1.1rem}
.zs-shuffle span{height:.5rem;border-radius:3px;background:var(--line-2)}
.zs-shuffle span:nth-child(1){width:68%}
.zs-shuffle span:nth-child(2){width:100%;animation:zs-shuffle-b 5s steps(1) infinite}
.zs-shuffle span:nth-child(3){width:52%;animation:zs-shuffle-c 5s steps(1) infinite}
@keyframes zs-shuffle-b{0%,45%{order:2}50%,100%{order:3}}
@keyframes zs-shuffle-c{0%,45%{order:3}50%,100%{order:2}}

/* --- 17. SCROLL STAGGER -----------------------------------------------
   Cards in the same row share a vertical scroll position, so their
   view()-timelines used to start together. Nudging each column's entry
   point makes a row cascade left-to-right instead of arriving at once. */
@supports (animation-timeline:view()){
  .zs-steps .zs-step:nth-child(1),
  .zs-curric .zs-cur:nth-child(1),
  .zs-grid .zs-card:nth-child(4n+1),
  .zs-portals .zs-portal:nth-child(1){animation-range:entry 4% cover 26%}
  .zs-steps .zs-step:nth-child(2),
  .zs-curric .zs-cur:nth-child(2),
  .zs-grid .zs-card:nth-child(4n+2),
  .zs-portals .zs-portal:nth-child(2){animation-range:entry 9% cover 31%}
  .zs-steps .zs-step:nth-child(3),
  .zs-curric .zs-cur:nth-child(3),
  .zs-grid .zs-card:nth-child(4n+3){animation-range:entry 14% cover 36%}
  .zs-steps .zs-step:nth-child(4),
  .zs-curric .zs-cur:nth-child(4),
  .zs-grid .zs-card:nth-child(4n+4){animation-range:entry 19% cover 41%}
}

/* --- 18. NAV, SCROLL-AWARE ---------------------------------------------
   Progressive enhancement: browsers without scroll-driven animations
   simply keep the plain sticky nav — nothing breaks.                   */
@supports (animation-timeline:scroll(root)){
  .zs-nav{
    animation:zs-nav-shrink linear both;
    animation-timeline:scroll(root);
    animation-range:0px 160px;
  }
}
@keyframes zs-nav-shrink{
  from{
    padding-top:.75rem;padding-bottom:.75rem;
    background:color-mix(in srgb,var(--ink) 84%,transparent);
    box-shadow:none;
  }
  to{
    padding-top:.5rem;padding-bottom:.5rem;
    background:color-mix(in srgb,var(--ink) 97%,transparent);
    box-shadow:0 10px 26px -18px rgba(0,0,0,.4);
  }
}

/* --- 19. GRAIN ----------------------------------------------------------
   Blended into the page's own background layer rather than a separate
   element, so there is no z-index to get wrong. Turn baseFrequency up
   or down below to taste.                                              */
.zs{
  background-color:var(--ink);
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-blend-mode:overlay;
  background-size:140px 140px;
}
html[data-theme='light'] .zs{background-blend-mode:soft-light}

/* --- 20. BRAND MARK — the real logo, not a placeholder box ------------
   The mark is already a detailed, coloured illustration, so it does not
   need a frame competing with it.                                      */
.zs-brand-mark{
  border:none;border-radius:0;
  width:2.5rem;height:2.5rem;
  object-fit:contain;
}

/* ==================================================================
   INTERACTIVE SHEET — subject picker above the hero sample sheet.
   Lives in ./landing-generator.tsx (a client component); this is
   purely presentational and slots into the existing .zs-sheet system.
   ================================================================== */
.zs-try-label{
  font-family:var(--mono);font-size:.62rem;letter-spacing:.14em;
  text-transform:uppercase;color:var(--fg-mute);margin-bottom:.6rem;
}
.zs-try-pills{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.9rem}
.zs-try-pill{
  font-family:var(--sans);font-size:.78rem;font-weight:600;
  padding:.4rem .85rem;border-radius:999px;border:1px solid var(--line-2);
  background:var(--ink-2);color:var(--fg-mute);cursor:pointer;
  transition:border-color .2s ease,color .2s ease,background-color .2s ease;
}
.zs-try-pill:hover{border-color:var(--edge-lit);color:var(--fg)}
.zs-try-pill-active{
  background:var(--green-lit);border-color:var(--green-lit);color:var(--on-accent);
}
.zs-try-pill-active:hover{color:var(--on-accent)}

/* The pills sit in normal flow above the sheet now, so the sheet-back
   and chip (both position:absolute) need their OWN positioned wrapper
   — otherwise they anchor to the whole stage's top-left, which is now
   where the pills are, and paint over them instead of the sheet. */
.zs-sheet-visual{position:relative}

/* While a new subject is being "generated," the sheet dims and softens
   rather than vanishing — the same feeling as the rest of the page's
   motion, never an abrupt swap. */
.zs-sheet-generating .zs-sheet{
  opacity:.35;filter:blur(1.5px) saturate(.7);pointer-events:none;
  transition:opacity .3s ease,filter .3s ease;
}

/* Fires once per swap: the sheet's React key changes on every subject
   pick, so this class's animation restarts on the freshly-mounted
   node — no JS timing beyond the swap itself needs to know about it.
   Not applied on first paint (see hasInteracted in the component), so
   the page's normal entrance sequence is the only thing that plays on
   load. */
.zs-sheet-fresh{animation:zs-sheet-pop .5s cubic-bezier(.2,.7,.2,1) both}
@keyframes zs-sheet-pop{
  from{opacity:0;transform:rotate(-1.1deg) translateY(14px) scale(.97)}
  to{opacity:1;transform:rotate(-1.1deg) translateY(0) scale(1)}
}

/* ==================================================================
   MOBILE STICKY CTA — thumb-zone action bar.
   Hidden on desktop, where the nav's own "Sign up" already covers
   this job. Sits above the WhatsApp bubble so the two never collide.
   ================================================================== */
.zs-sticky-cta{
  display:none;
  position:fixed;left:0;right:0;bottom:0;z-index:65;
  padding:.75rem 1rem calc(.75rem + env(safe-area-inset-bottom,0px));
  background:color-mix(in srgb,var(--ink) 92%,transparent);
  backdrop-filter:blur(14px);
  border-top:1px solid var(--line);
  box-shadow:0 -12px 30px -18px rgba(0,0,0,.5);
}
.zs-sticky-cta .zs-btn{justify-content:center}
@media (max-width:899px){
  .zs-sticky-cta{display:block}
  .zs-wa{bottom:calc(4.6rem + env(safe-area-inset-bottom,0px))}
  .zs-foot{padding-bottom:calc(4.6rem + env(safe-area-inset-bottom,0px))}
}
`
