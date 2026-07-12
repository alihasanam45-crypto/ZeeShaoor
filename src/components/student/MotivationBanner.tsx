'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, CloudSun } from 'lucide-react'

interface Greeting {
  period: string
  icon: typeof Sun
  quote: string
  author: string
  gradient: string
  iconColor: string
}

const GREETINGS: Greeting[] = [
  {
    period: 'Morning',
    icon: Sun,
    quote: 'The expert in anything was once a beginner. Every session counts.',
    author: 'ZeeShaoor AI',
    gradient: 'from-amber-100/70 via-orange-50/50 to-transparent',
    iconColor: 'text-amber-500',
  },
  {
    period: 'Afternoon',
    icon: CloudSun,
    quote: 'Success is the sum of small efforts repeated day in and day out.',
    author: 'Robert Collier',
    gradient: 'from-sky-100/70 via-blue-50/50 to-transparent',
    iconColor: 'text-sky-500',
  },
  {
    period: 'Evening',
    icon: Moon,
    quote: 'The beautiful thing about learning is that no one can take it away from you.',
    author: 'B.B. King',
    gradient: 'from-indigo-100/70 via-purple-50/50 to-transparent',
    iconColor: 'text-indigo-500',
  },
]

export default function MotivationBanner() {
  const [greeting, setGreeting] = useState<Greeting>(GREETINGS[0])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting(GREETINGS[0])
    else if (hour < 17) setGreeting(GREETINGS[1])
    else setGreeting(GREETINGS[2])
  }, [])

  const Icon = greeting.icon

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${greeting.gradient}`} />
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/60 blur-3xl" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
          <Icon size={20} className={greeting.iconColor} />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Good {greeting.period}
          </p>
          <p className="mb-2 text-base font-medium leading-relaxed text-slate-700">
            "{greeting.quote}"
          </p>
          <p className="text-xs font-semibold text-slate-400">— {greeting.author}</p>
        </div>
      </div>
    </div>
  )
}
