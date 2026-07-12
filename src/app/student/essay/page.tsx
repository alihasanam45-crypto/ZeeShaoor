'use client'

import Link from 'next/link'
import { FileText, Plus, ArrowLeft, Clock, CheckCircle } from 'lucide-react'

const essays = [
  { id: '1', title: 'Importance of Education', subject: 'English', status: 'Graded', grade: 'A', date: '2026-07-08' },
  { id: '2', title: 'Pakistan\'s Future in Tech', subject: 'Computer Science', status: 'Submitted', grade: '-', date: '2026-07-05' },
  { id: '3', title: 'Climate Change Solutions', subject: 'Science', status: 'Draft', grade: '-', date: '2026-07-01' },
]

export default function EssayPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center gap-4">
        <Link href="/student" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <FileText size={24} className="text-blue-600" />
        <h1 className="text-xl font-semibold flex-1">Essay Writing</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
          <Plus size={18} /> Write New
        </button>
      </header>
      <div className="max-w-3xl mx-auto p-6 space-y-3">
        {essays.map((essay) => (
          <div key={essay.id} className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{essay.title}</h3>
              <p className="text-sm text-gray-500">{essay.subject} &middot; {essay.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm px-2 py-1 rounded ${essay.status === 'Graded' ? 'bg-green-100 text-green-700' : essay.status === 'Submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                {essay.status === 'Graded' ? <CheckCircle size={14} className="inline mr-1" /> : <Clock size={14} className="inline mr-1" />}
                {essay.status}{essay.grade !== '-' ? ` - ${essay.grade}` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
