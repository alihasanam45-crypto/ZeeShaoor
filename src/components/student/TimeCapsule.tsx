'use client'

import { useState } from 'react'
import { Clock, Lock, Unlock, Plus, Send, Archive } from 'lucide-react'

interface Capsule {
  id: number
  subject: string
  message: string
  unlockDate: string
  opened: boolean
}

export default function TimeCapsule() {
  const [capsules, setCapsules] = useState<Capsule[]>([
    { id: 1, subject: 'Mathematics', message: 'Hope you mastered calculus by now!', unlockDate: '2026-08-15', opened: false },
    { id: 2, subject: 'General', message: 'Don\'t forget to take breaks. Future you will thank yourself.', unlockDate: '2026-06-01', opened: true },
  ])
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [unlockDate, setUnlockDate] = useState('')

  const handleCreate = () => {
    if (!subject || !message || !unlockDate) return
    setCapsules(prev => [...prev, {
      id: Date.now(),
      subject,
      message,
      unlockDate,
      opened: false,
    }])
    setSubject('')
    setMessage('')
    setUnlockDate('')
    setShowForm(false)
  }

  const handleOpen = (id: number) => {
    setCapsules(prev => prev.map(c => c.id === id ? { ...c, opened: true } : c))
  }

  const now = new Date()
  const sealed = capsules.filter(c => !c.opened)
  const opened = capsules.filter(c => c.opened)

  const getCountdown = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - now.getTime()
    if (diff <= 0) return 'Ready to open!'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return `${days} days left`
  }

  const renderCapsule = (capsule: Capsule) => (
    <div
      key={capsule.id}
      className={`rounded-xl border p-4 transition-all ${
        capsule.opened
          ? 'border-green-800/30 bg-green-950/10'
          : 'border-gray-700/50 bg-gray-800/40 hover:border-cyan-700/50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {capsule.opened
            ? <Unlock size={14} className="text-green-400" />
            : <Lock size={14} className="text-cyan-400" />
          }
          <div>
            <p className="text-xs font-bold text-white">{capsule.subject}</p>
            <p className="text-[10px] text-gray-500">
              {capsule.opened ? `Opened` : getCountdown(capsule.unlockDate)}
            </p>
          </div>
        </div>
        {!capsule.opened && new Date(capsule.unlockDate) <= now && (
          <button
            onClick={() => handleOpen(capsule.id)}
            className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded-lg border border-cyan-800/50"
          >
            Open
          </button>
        )}
      </div>
      {capsule.opened && (
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{capsule.message}</p>
      )}
    </div>
  )

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center">
            <Clock size={16} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Time Capsule</h3>
            <p className="text-xs text-gray-500">Messages for your future self</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
        >
          <Plus size={14} />
          New
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 rounded-xl bg-gray-800/60 border border-gray-700 space-y-3">
          <input
            type="text"
            placeholder="Subject (e.g. Mathematics, Motivation)"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full text-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-700"
          />
          <textarea
            placeholder="Your message to future self..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            className="w-full text-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-700 resize-none"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={unlockDate}
              onChange={e => setUnlockDate(e.target.value)}
              className="flex-1 text-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-700"
            />
            <button
              onClick={handleCreate}
              className="flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-lg bg-cyan-900/50 text-cyan-400 border border-cyan-700 hover:bg-cyan-900/70"
            >
              <Send size={12} />
              Seal
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 flex items-center gap-1">
          <Lock size={10} /> Sealed ({sealed.length})
        </p>
        {sealed.length === 0 && <p className="text-xs text-gray-600 text-center py-3">No sealed capsules</p>}
        {sealed.map(renderCapsule)}
      </div>

      {opened.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-800 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 flex items-center gap-1">
            <Archive size={10} /> Opened ({opened.length})
          </p>
          {opened.map(renderCapsule)}
        </div>
      )}
    </div>
  )
}
