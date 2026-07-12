'use client'

import Link from 'next/link'
import { Headphones, Plus, ArrowLeft, Circle } from 'lucide-react'

const tickets = [
  { id: '1', subject: 'Login issue', status: 'Open', date: '2026-07-09', priority: 'High' },
  { id: '2', subject: 'Assignment not visible', status: 'Closed', date: '2026-07-07', priority: 'Medium' },
  { id: '3', subject: 'Fee payment error', status: 'Open', date: '2026-07-06', priority: 'Low' },
]

export default function HelpdeskPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center gap-4">
        <Link href="/student" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <Headphones size={24} className="text-blue-600" />
        <h1 className="text-xl font-semibold flex-1">Help Desk</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm">
          <Plus size={18} /> Create Ticket
        </button>
      </header>
      <div className="max-w-3xl mx-auto p-6 space-y-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Circle size={10} className={ticket.status === 'Open' ? 'text-green-500' : 'text-gray-400'} />
              <div>
                <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                <p className="text-sm text-gray-500">{ticket.date} &middot; {ticket.priority}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-medium ${ticket.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {ticket.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
