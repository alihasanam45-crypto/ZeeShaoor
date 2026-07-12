import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, GraduationCap, Rocket, Shield } from 'lucide-react'

const PORTALS = [
  {
    title: 'Admin Console',
    tagline: 'God-mode command center — live school pulse, AI control & system health.',
    href: '/admin',
    icon: Shield,
    ring: 'from-cyan-500 to-blue-500',
    glow: 'group-hover:shadow-[0_0_40px_rgba(6,182,212,0.35)]',
    accent: 'text-cyan-400',
  },
  {
    title: 'Teacher Portal',
    tagline: 'Paper generator, class analytics, pacing & student interventions.',
    href: '/teacher',
    icon: GraduationCap,
    ring: 'from-indigo-500 to-purple-500',
    glow: 'group-hover:shadow-[0_0_40px_rgba(129,140,248,0.35)]',
    accent: 'text-indigo-400',
  },
  {
    title: 'Student Launchpad',
    tagline: 'Brain meter, streaks, weak-topic radar & board-exam readiness.',
    href: '/student/dashboard',
    icon: Rocket,
    ring: 'from-purple-500 to-pink-500',
    glow: 'group-hover:shadow-[0_0_40px_rgba(217,70,239,0.35)]',
    accent: 'text-fuchsia-400',
  },
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] font-sans text-white selection:bg-cyan-500/40">
      {/* Ambient neon glows */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500 opacity-[0.10] blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-600 opacity-[0.10] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-fuchsia-500 opacity-[0.08] blur-[120px]" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="ZeeShaoor.pk"
            width={40}
            height={40}
            priority
            className="rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.25)]"
          />
          <span className="text-xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              ZeeShaoor
            </span>
            <span className="text-white">.pk</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(6,182,212,0.30)] transition-opacity hover:opacity-90"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-16 text-center sm:py-24">
        <div className="mb-10 flex justify-center">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-cyan-500/20 blur-2xl" />
            <Image
              src="/logo.png"
              alt="ZeeShaoor.pk"
              width={112}
              height={112}
              priority
              className="relative rounded-[2rem] border border-white/10 shadow-[0_0_40px_rgba(6,182,212,0.35)]"
            />
          </div>
        </div>

        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-cyan-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          Pakistan&apos;s #1 AI Educational Platform
        </p>

        <h1 className="mx-auto max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
          Pakistan&apos;s No. 1 <span className="text-cyan-400">Automated</span>
          <br className="hidden sm:block" /> Educational Paper Generator
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-white/50">
          Three isolated portals, one platform. Sign in to your workspace on{' '}
          <span className="font-semibold text-white/80">ZeeShaoor.pk</span>.
        </p>

        {/* Portal cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {PORTALS.map((portal) => (
            <Link
              key={portal.title}
              href={portal.href}
              className={`group rounded-3xl bg-gradient-to-br ${portal.ring} p-[2px] transition-transform duration-300 hover:-translate-y-1`}
            >
              <div
                className={`flex h-full flex-col items-center gap-4 rounded-[22px] bg-[#0a0a0a] p-8 transition-shadow duration-300 ${portal.glow}`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${portal.ring} shadow-lg`}
                >
                  <portal.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{portal.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{portal.tagline}</p>
                <span
                  className={`mt-2 inline-flex items-center gap-1.5 text-sm font-semibold ${portal.accent} transition-transform group-hover:translate-x-0.5`}
                >
                  Access Portal
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-xs text-white/40">
        © {new Date().getFullYear()} ZeeShaoor.pk — Awakening Intellect, Anchoring Truth
      </footer>
    </div>
  )
}
