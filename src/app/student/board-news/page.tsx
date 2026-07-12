'use client'

import Link from 'next/link'
import { Newspaper, ArrowLeft, Calendar } from 'lucide-react'

const news = [
  { id: '1', title: 'Annual Result Day Announced', date: '2026-07-15', excerpt: 'The annual results will be declared on July 20th. Students are advised to check the portal.' },
  { id: '2', title: 'Science Exhibition Winners', date: '2026-07-10', excerpt: 'Congratulations to all winners of the inter-school science exhibition.' },
  { id: '3', title: 'Summer Vacation Schedule', date: '2026-07-05', excerpt: 'Summer break will commence from August 1st to August 31st.' },
]

export default function BoardNewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center gap-4">
        <Link href="/student" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <Newspaper size={24} className="text-blue-600" />
        <h1 className="text-xl font-semibold">Board News</h1>
      </header>
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        {news.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <Calendar size={14} />
              <span>{item.date}</span>
            </div>
            <p className="text-gray-600 mt-2">{item.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
