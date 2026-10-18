'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Sparkles, X } from 'lucide-react'

interface PromptSet {
  match: string
  heading: string
  prompts: string[]
}

const CONTEXT_PROMPTS: PromptSet[] = [
  {
    match: '/student/quiz',
    heading: 'Stuck on this quiz?',
    prompts: [
      'Explain why my last answer was wrong',
      'Give me a similar question to practice',
      'Share a memory trick for this concept',
    ],
  },
  {
    match: '/student/study',
    heading: 'Studying smarter',
    prompts: [
      'Summarize this chapter in 5 bullets',
      'Turn this topic into flashcards',
      'Test me with 3 quick questions',
    ],
  },
  {
    match: '/student/simulator',
    heading: 'Exam mode support',
    prompts: [
      'Time-management tips for this paper',
      'How do I approach numericals faster?',
      'Help me stay calm during the exam',
    ],
  },
  {
    match: '/student/past-papers',
    heading: 'Past paper intel',
    prompts: [
      'Which chapters appear most often?',
      'Explain the marking scheme for long questions',
      'Predict likely questions this year',
    ],
  },
  {
    match: '/student/essay',
    heading: 'Essay coaching',
    prompts: [
      'Outline an essay structure for me',
      'Strengthen my introduction paragraph',
      'Give me 5 power vocabulary words',
    ],
  },
]

const DEFAULT_PROMPTS: PromptSet = {
  match: '',
  heading: 'Quick help',
  prompts: [
    'Plan my next 25-minute study session',
    'What should I revise today?',
    'Explain a concept in simple words',
  ],
}

export default function AIAssistOrb() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const context = CONTEXT_PROMPTS.find(c => pathname?.startsWith(c.match)) ?? DEFAULT_PROMPTS

  return (
    <div className="fixed bottom-6 right-6 z-[80]">
      {/* Contextual help panel */}
      <div
        aria-hidden={!open}
        className={`absolute bottom-[4.5rem] right-0 w-80 origin-bottom-right rounded-[2rem] border border-slate-100 bg-white/95 p-5 shadow-[0_20px_60px_rgb(15,23,42,0.12)] backdrop-blur-2xl transition-all duration-300 ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-2 scale-95 opacity-0'
        }`}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-800">AI Study Companion</p>
            <p className="text-xs text-slate-400">{context.heading}</p>
          </div>
        </div>

        <div className="space-y-2">
          {context.prompts.map(prompt => (
            <Link
              key={prompt}
              href={`/student/ai-ask?q=${encodeURIComponent(prompt)}`}
              onClick={() => setOpen(false)}
              className="block rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {prompt}
            </Link>
          ))}
        </div>

        <Link
          href="/student/ai-ask"
          onClick={() => setOpen(false)}
          className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-500"
        >
          Open AI Ask
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* The orb */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Close AI Study Companion' : 'Open AI Study Companion'}
        aria-expanded={open}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-[0_12px_30px_rgb(99,102,241,0.35)] transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/30 [animation-duration:3s]" />
        )}
        <span className="relative">
          {open ? <X className="h-5 w-5" /> : <Sparkles className="h-6 w-6" />}
        </span>
      </button>
    </div>
  )
}
