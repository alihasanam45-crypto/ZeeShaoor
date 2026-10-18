'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Send, Bot, User, ArrowLeft } from 'lucide-react'

const mockQA = [
  { id: '1', question: 'What is Newton\'s first law?', answer: 'An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.' },
  { id: '2', question: 'Explain photosynthesis', answer: 'Photosynthesis is the process by which plants convert sunlight into chemical energy.' },
]

export default function AiAskPage() {
  const [input, setInput] = useState('')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center gap-4">
        <Link href="/student" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-semibold">AI Assistant</h1>
      </header>
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        {mockQA.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg">
              <User size={20} className="text-blue-600 mt-1" />
              <p className="text-gray-800">{item.question}</p>
            </div>
            <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
              <Bot size={20} className="text-green-600 mt-1" />
              <p className="text-gray-700">{item.answer}</p>
            </div>
          </div>
        ))}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Send size={18} /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
