'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trophy, ArrowLeft, Medal } from 'lucide-react'

const toppers = [
  { rank: 1, name: 'Ahmed Khan', class: '10-A', score: 98.5 },
  { rank: 2, name: 'Sara Ali', class: '10-A', score: 97.2 },
  { rank: 3, name: 'Bilal Ahmed', class: '10-B', score: 96.8 },
  { rank: 4, name: 'Fatima Noor', class: '10-A', score: 95.1 },
  { rank: 5, name: 'Usman Raza', class: '10-B', score: 94.3 },
]

const classes = ['All', '10-A', '10-B', '9-A', '9-B']

export default function ToppersPage() {
  const [selectedClass, setSelectedClass] = useState('All')

  const filtered = selectedClass === 'All'
    ? toppers
    : toppers.filter((t) => t.class === selectedClass)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center gap-4">
        <Link href="/student" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <Trophy size={24} className="text-yellow-500" />
        <h1 className="text-xl font-semibold">Toppers</h1>
      </header>
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <div className="flex gap-2">
          {classes.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-3 py-1 rounded text-sm font-medium ${selectedClass === c ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Rank</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Class</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.rank} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      {t.rank <= 3 && <Medal size={16} className={t.rank === 1 ? 'text-yellow-500' : t.rank === 2 ? 'text-gray-400' : 'text-orange-400'} />}
                      {t.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-gray-600">{t.class}</td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-600">{t.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
