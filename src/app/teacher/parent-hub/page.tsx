'use client'

import { MessageSquare, Phone, Mail, CheckCircle, Clock } from 'lucide-react'

const contacts = [
  { name: 'Mr. Ahmed Khan', student: 'Ali Khan', lastContact: '2026-07-09', status: 'Reached', method: 'Phone' },
  { name: 'Mrs. Sara Ali', student: 'Fatima Ali', lastContact: '2026-07-08', status: 'Pending', method: 'Message' },
  { name: 'Mr. Usman Raza', student: 'Hira Raza', lastContact: '2026-07-07', status: 'Reached', method: 'Email' },
]

export default function ParentHubPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Parent Hub</h1>
      <div className="space-y-3">
        {contacts.map((c) => (
          <div key={c.name} className="bg-white rounded-lg border p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{c.name}</h3>
              <p className="text-sm text-gray-500">Student: {c.student} &middot; {c.lastContact}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                {c.method === 'Phone' ? <Phone size={14} /> : c.method === 'Email' ? <Mail size={14} /> : <MessageSquare size={14} />}
                {c.method}
              </span>
              <span className={`text-xs px-2 py-1 rounded font-medium flex items-center gap-1 ${c.status === 'Reached' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {c.status === 'Reached' ? <CheckCircle size={12} /> : <Clock size={12} />}
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
