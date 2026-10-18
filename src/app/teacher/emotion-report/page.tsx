'use client'

import { useState } from 'react'
import { Smile, Frown, Meh, Angry } from 'lucide-react'

const students = [
  { name: 'Ali Raza', emotion: 'Happy', date: '2026-07-10' },
  { name: 'Sana Khan', emotion: 'Neutral', date: '2026-07-10' },
  { name: 'Usman Ali', emotion: 'Sad', date: '2026-07-10' },
  { name: 'Hira Batool', emotion: 'Angry', date: '2026-07-09' },
  { name: 'Zain Ahmed', emotion: 'Happy', date: '2026-07-09' },
]

const emotionIcons: Record<string, React.ReactNode> = {
  Happy: <Smile size={18} className="text-green-500" />,
  Neutral: <Meh size={18} className="text-yellow-500" />,
  Sad: <Frown size={18} className="text-orange-500" />,
  Angry: <Angry size={18} className="text-red-500" />,
}

export default function EmotionReportPage() {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? students : students.filter((s) => s.emotion === filter)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Emotion Reports</h1>
      <div className="flex gap-2 mb-4">
        {['All', 'Happy', 'Neutral', 'Sad', 'Angry'].map((e) => (
          <button key={e} onClick={() => setFilter(e)} className={`px-3 py-1 rounded text-sm ${filter === e ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>{e}</button>
        ))}
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Student</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Emotion</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.name} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 flex items-center gap-2">{emotionIcons[s.emotion]} {s.emotion}</td>
                <td className="px-4 py-3 text-gray-600">{s.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
