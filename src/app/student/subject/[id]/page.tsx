'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Book, ArrowLeft, CheckCircle, Circle, BarChart3 } from 'lucide-react'

const topics = [
  { name: 'Chapter 1', progress: 100 },
  { name: 'Chapter 2', progress: 75 },
  { name: 'Chapter 3', progress: 30 },
  { name: 'Chapter 4', progress: 0 },
]

export default function SubjectPage() {
  const params = useParams()
  const id = params?.id as string || 'subject'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center gap-4">
        <Link href="/student" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <Book size={24} className="text-blue-600" />
        <h1 className="text-xl font-semibold capitalize">{id.replace(/-/g, ' ')}</h1>
      </header>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" /> Progress
          </h2>
          <div className="space-y-3">
            {topics.map((topic) => (
              <div key={topic.name} className="flex items-center gap-3">
                {topic.progress === 100 ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : (
                  <Circle size={18} className="text-gray-300" />
                )}
                <span className="flex-1 text-gray-800">{topic.name}</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${topic.progress}%` }} />
                </div>
                <span className="text-sm text-gray-500 w-10 text-right">{topic.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
