'use client'

import { Users, TrendingUp, Share2, BookOpen } from 'lucide-react'

interface RippleStat {
  label: string
  value: string
  icon: typeof Users
  color: string
}

interface Connection {
  id: number
  name: string
  impact: string
  relation: string
}

const STATS: RippleStat[] = [
  { label: 'Peers Helped', value: '24', icon: Users, color: 'text-cyan-400' },
  { label: 'Study Groups Led', value: '8', icon: TrendingUp, color: 'text-green-400' },
  { label: 'Resources Shared', value: '37', icon: Share2, color: 'text-purple-400' },
  { label: 'Mentoring Sessions', value: '12', icon: BookOpen, color: 'text-yellow-400' },
]

const CONNECTIONS: Connection[] = [
  { id: 1, name: 'Zainab A.', impact: 'Improved Math score by 30%', relation: 'Study Buddy' },
  { id: 2, name: 'Hassan R.', impact: 'Started daily revision habit', relation: 'Mentee' },
  { id: 3, name: 'Mahnoor S.', impact: 'Aced Chemistry midterms', relation: 'Group Member' },
  { id: 4, name: 'Rayan K.', impact: 'Built confidence in Physics', relation: 'Classmate' },
]

export default function RippleEffect() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center">
          <Share2 size={16} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Your Ripple Effect</h3>
          <p className="text-xs text-gray-500">How your learning impacts others</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {STATS.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl bg-gray-800/40 border border-gray-700/50 p-3 text-center">
              <Icon size={16} className={`${stat.color} mx-auto mb-1`} />
              <p className="text-lg font-black text-white">{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-medium">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Your Impact Network</p>
        <div className="space-y-2">
          {CONNECTIONS.map(conn => (
            <div key={conn.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 border border-gray-700/30">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                {conn.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">{conn.name}</p>
                <p className="text-[10px] text-gray-500">{conn.impact}</p>
                <span className="text-[9px] text-gray-600 font-medium">{conn.relation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
