'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Download, ExternalLink, FileText, Search } from 'lucide-react'
import { CLASS_SUBJECT_MATRIX } from '@/lib/subjects'

const BOARDS = ['Punjab', 'Sindh', 'KPK', 'Federal', 'AJK']
const YEARS  = Array.from({ length: 11 }, (_, i) => 2024 - i)

export default function PastPapersPage() {
  const [papers, setPapers]     = useState<any[]>([])
  const [loading, setLoading]   = useState(false)
  const [classLevel, setClass]  = useState('9')
  const [subject, setSubject]   = useState('')
  const [board, setBoard]       = useState('')
  const [year, setYear]         = useState('')
  const [search, setSearch]     = useState('')

  const subjects = CLASS_SUBJECT_MATRIX[classLevel] || []

  useEffect(() => { setSubject('') }, [classLevel])
  useEffect(() => { fetchPapers() }, [classLevel, subject, board, year])

  async function fetchPapers() {
    setLoading(true)
    const params = new URLSearchParams()
    if (classLevel) params.set('classLevel', classLevel)
    if (subject)    params.set('subject', subject)
    if (board)      params.set('board', board)
    if (year)       params.set('year', year)
    const res  = await fetch(`/api/student/past-papers?${params}`)
    const data = await res.json()
    setPapers(data.data || [])
    setLoading(false)
  }

  async function markSolved(paperId: string) {
    await fetch('/api/student/past-papers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paperId })
    })
  }

  const filtered = papers.filter(p =>
    search === '' ||
    p.subject.toLowerCase().includes(search.toLowerCase()) ||
    p.board.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen size={24} className="text-pink-400" />
            <h1 className="text-2xl font-black text-white">Past Papers</h1>
          </div>
          <p className="text-gray-500 text-sm">Punjab, Sindh, KPK, Federal — last 10 years</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select value={classLevel} onChange={e => setClass(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-500">
              {Object.keys(CLASS_SUBJECT_MATRIX).map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-500">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={board} onChange={e => setBoard(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-500">
              <option value="">All Boards</option>
              {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={year} onChange={e => setYear(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-500">
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search subject or board..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-pink-500" />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-gray-500">Loading...</div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText size={40} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-500 font-semibold">Koi paper nahi mila</p>
            <p className="text-gray-700 text-sm mt-1">
              Admin se papers upload karwao ya filter change karo
            </p>
          </div>
        )}

        {/* Papers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(paper => (
            <div key={paper._id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-pink-800 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {paper.board} Board • Class {paper.classLevel}
                  </p>
                  <h3 className="text-white font-bold mt-0.5">{paper.subject}</h3>
                  <p className="text-pink-400 font-black text-lg">{paper.year}</p>
                </div>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">
                  {paper.paperType}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                {paper.totalSolves} students ne solve kiya
              </p>
              <div className="flex gap-2">
                <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => markSolved(paper._id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-bold transition-colors">
                  <ExternalLink size={14} /> View Paper
                </a>
                <a href={paper.pdfUrl} download
                  className="flex items-center justify-center px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700">
                  <Download size={14} />
                </a>
                {paper.solutionUrl && (
                  <a href={paper.solutionUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 rounded-xl bg-green-900 hover:bg-green-800 text-green-400 border border-green-800 text-sm font-bold">
                    Key
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}