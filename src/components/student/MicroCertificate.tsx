'use client'

import { Award, ChevronRight, ExternalLink } from 'lucide-react'

interface Certificate {
  id: number
  title: string
  subject: string
  dateEarned: string
  badge: string
}

const CERTIFICATES: Certificate[] = [
  { id: 1, title: 'Algebra Mastery', subject: 'Mathematics', dateEarned: '2026-03-15', badge: '🥇' },
  { id: 2, title: 'Chemical Bonding Pro', subject: 'Chemistry', dateEarned: '2026-02-28', badge: '🥈' },
  { id: 3, title: 'Essay Writing Excellence', subject: 'English', dateEarned: '2026-01-20', badge: '🥇' },
  { id: 4, title: 'Pakistan History Scholar', subject: 'Pakistan Studies', dateEarned: '2025-12-10', badge: '🥉' },
]

export default function MicroCertificate() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-yellow-950 border border-yellow-800 flex items-center justify-center">
          <Award size={16} className="text-yellow-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Micro Certificates</h3>
          <p className="text-xs text-gray-500">Skills you've mastered</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CERTIFICATES.map(cert => (
          <div
            key={cert.id}
            className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-4 transition-all hover:border-yellow-700/50 hover:bg-gray-800/60"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{cert.badge}</span>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{cert.title}</h4>
                <p className="text-[10px] text-gray-500">{cert.subject}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-600">Earned {cert.dateEarned}</span>
              <button className="text-gray-500 hover:text-cyan-400 transition-colors">
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 w-full flex items-center justify-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 py-2 rounded-xl border border-gray-700/50 hover:border-cyan-700/50 transition-all">
        View All Certificates
        <ChevronRight size={12} />
      </button>
    </div>
  )
}
