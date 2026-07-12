'use client'

import { useState } from 'react'
import { FilePlus, Plus, Trash2 } from 'lucide-react'

export default function TestCreatorPage() {
  const [questions, setQuestions] = useState<string[]>([''])
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')

  const addQuestion = () => setQuestions([...questions, ''])
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i))
  const updateQuestion = (i: number, v: string) => {
    const next = [...questions]; next[i] = v; setQuestions(next)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FilePlus size={24} className="text-blue-600" /> Test Creator</h1>
      <div className="max-w-2xl space-y-4">
        <input type="text" placeholder="Test Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
        <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" placeholder={`Question ${i + 1}`} value={q} onChange={(e) => updateQuestion(i, e.target.value)} className="flex-1 border rounded-lg px-4 py-2" />
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(i)} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></button>
              )}
            </div>
          ))}
        </div>
        <button onClick={addQuestion} className="flex items-center gap-2 text-blue-600 hover:text-blue-800"><Plus size={18} /> Add Question</button>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Create Test</button>
      </div>
    </div>
  )
}
