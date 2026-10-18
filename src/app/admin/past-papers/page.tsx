'use client'

import { useState, useEffect } from 'react'
import { CLASS_SUBJECT_MATRIX } from '@/lib/subjects'

const BOARDS = ['Punjab', 'Sindh', 'KPK', 'Federal', 'AJK']
const YEARS  = Array.from({ length: 11 }, (_, i) => 2024 - i)

export default function AdminPastPapersPage() {
  const [papers, setPapers]       = useState<any[]>([])
  const [loading, setLoading]     = useState(false)
  const [msg, setMsg]             = useState('')
  const [classLevel, setClass]    = useState('9')
  const [subject, setSubject]     = useState('')
  const [board, setBoard]         = useState('Punjab')
  const [year, setYear]           = useState('2024')
  const [paperType, setPaperType] = useState('Annual')
  const [pdfUrl, setPdfUrl]       = useState('')
  const [solutionUrl, setSolution]= useState('')

  const subjects = CLASS_SUBJECT_MATRIX[classLevel] || []

  useEffect(() => { loadPapers() }, [])

  async function loadPapers() {
    const res  = await fetch('/api/admin/past-papers')
    const data = await res.json()
    setPapers(data.data || [])
  }

  async function addPaper() {
    if (!subject || !pdfUrl) {
      setMsg('Subject aur PDF URL zaroori hain')
      return
    }
    setLoading(true)
    setMsg('')
    const res = await fetch('/api/admin/past-papers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classLevel, subject, board,
        year: parseInt(year),
        paperType, pdfUrl,
        solutionUrl: solutionUrl || undefined
      })
    })
    const data = await res.json()
    if (!res.ok) {
      setMsg(data.error || 'Error aaya')
    } else {
      setMsg('✅ Paper add ho gaya!')
      setPdfUrl('')
      setSolution('')
      loadPapers()
    }
    setLoading(false)
  }

  async function deletePaper(id: string) {
    await fetch('/api/admin/past-papers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    loadPapers()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Past Papers Manager</h1>

      {/* Add Form */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-8">
        <h2 className="text-sm font-bold text-gray-400 uppercase mb-4">Naya Paper Add Karo</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Class</label>
            <select value={classLevel} onChange={e => setClass(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm">
              {Object.keys(CLASS_SUBJECT_MATRIX).map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm">
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Board</label>
            <select value={board} onChange={e => setBoard(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm">
              {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Year</label>
            <select value={year} onChange={e => setYear(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Paper Type</label>
            <select value={paperType} onChange={e => setPaperType(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm">
              <option value="Annual">Annual</option>
              <option value="Supplementary">Supplementary</option>
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">PDF URL (Cloudinary link)</label>
          <input type="text" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-500" />
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Solution Key URL (optional)</label>
          <input type="text" value={solutionUrl} onChange={e => setSolution(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" />
        </div>

        {msg && (
          <p className={`text-sm mb-3 ${msg.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>
        )}

        <button onClick={addPaper} disabled={loading}
          className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
          {loading ? 'Adding...' : 'Paper Add Karo'}
        </button>
      </div>

      {/* Papers List */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase mb-3">
          All Papers ({papers.length})
        </h2>
        <div className="space-y-3">
          {papers.map(paper => (
            <div key={paper._id}
              className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <div>
                <p className="text-white font-semibold text-sm">
                  {paper.subject} — Class {paper.classLevel}
                </p>
                <p className="text-gray-500 text-xs">
                  {paper.board} • {paper.year} • {paper.paperType}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-pink-400 hover:text-pink-300">View</a>
                <button onClick={() => deletePaper(paper._id)}
                  className="text-xs text-red-500 hover:text-red-400">Delete</button>
              </div>
            </div>
          ))}
          {papers.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-8">Koi paper nahi hai abhi</p>
          )}
        </div>
      </div>
    </div>
  )
}