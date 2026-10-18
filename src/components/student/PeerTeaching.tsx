'use client'

import { useState } from 'react'
import { Users, Clock, BookOpen, Calendar, CheckCircle, Send } from 'lucide-react'

interface Peer {
  id: number
  name: string
  subject: string
  slots: string[]
}

interface Session {
  id: number
  peer: string
  subject: string
  time: string
  status: 'requested' | 'upcoming' | 'completed'
}

const AVAILABLE_PEERS: Peer[] = [
  { id: 1, name: 'Ayesha M.', subject: 'Mathematics', slots: ['Mon 4pm', 'Wed 3pm', 'Fri 5pm'] },
  { id: 2, name: 'Bilal K.', subject: 'Physics', slots: ['Tue 2pm', 'Thu 4pm'] },
  { id: 3, name: 'Hira T.', subject: 'Chemistry', slots: ['Mon 5pm', 'Wed 4pm', 'Sat 11am'] },
]

const tabs = ['Available', 'Requested', 'Upcoming'] as const
type Tab = typeof tabs[number]

export default function PeerTeaching() {
  const [activeTab, setActiveTab] = useState<Tab>('Available')
  const [sessions, setSessions] = useState<Session[]>([
    { id: 1, peer: 'Ayesha M.', subject: 'Mathematics', time: 'Mon 4pm', status: 'requested' },
    { id: 2, peer: 'Bilal K.', subject: 'Physics', time: 'Tue 2pm', status: 'upcoming' },
  ])

  const handleRequest = (peer: Peer, slot: string) => {
    setSessions(prev => [...prev, {
      id: Date.now(),
      peer: peer.name,
      subject: peer.subject,
      time: slot,
      status: 'requested',
    }])
  }

  const getFilteredSessions = () => {
    if (activeTab === 'Available') return null
    if (activeTab === 'Requested') return sessions.filter(s => s.status === 'requested')
    return sessions.filter(s => s.status === 'upcoming')
  }

  const filtered = getFilteredSessions()

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center">
          <Users size={16} className="text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">Peer Teaching</h3>
          <p className="text-xs text-gray-500">Learn together, grow together</p>
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-gray-800/60 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-gray-700 text-white shadow'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Available' && (
        <div className="space-y-3">
          {AVAILABLE_PEERS.map(peer => (
            <div key={peer.id} className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{peer.name}</h4>
                  <span className="text-[10px] text-gray-500">{peer.subject}</span>
                </div>
                <BookOpen size={14} className="text-blue-400" />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {peer.slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => handleRequest(peer, slot)}
                    className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-lg bg-gray-700/50 text-gray-300 border border-gray-600 hover:border-cyan-700 hover:text-cyan-400 transition-all"
                  >
                    <Clock size={10} />
                    {slot}
                    <Send size={10} className="ml-1" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {(activeTab === 'Requested' || activeTab === 'Upcoming') && filtered && (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-xs text-gray-600 text-center py-6">No {activeTab.toLowerCase()} sessions</p>
          )}
          {filtered.map(session => (
            <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <Calendar size={14} className="text-gray-500" />
                <div>
                  <p className="text-xs font-bold text-white">{session.subject}</p>
                  <p className="text-[10px] text-gray-500">{session.peer} • {session.time}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                session.status === 'requested'
                  ? 'text-yellow-400 bg-yellow-950/30 border border-yellow-800'
                  : 'text-green-400 bg-green-950/30 border border-green-800'
              }`}>
                {session.status === 'requested' ? 'Pending' : 'Confirmed'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
