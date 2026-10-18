'use client'

import { useState, useEffect } from 'react'

export default function SystemIdsPage() {
  const [ids, setIds]       = useState<any[]>([])
  const [count, setCount]   = useState(10)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')

  async function loadIds() {
    const res  = await fetch('/api/admin/system-ids')
    const data = await res.json()
    setIds(data.data || [])
  }

  useEffect(() => { loadIds() }, [])

  async function generate() {
    setLoading(true)
    const res = await fetch('/api/admin/system-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count })
    })
    const data = await res.json()
    setMsg(`${data.data?.length} IDs generate ho gayi!`)
    loadIds()
    setLoading(false)
  }

  async function deleteId(code: string) {
    await fetch('/api/admin/system-ids', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
    loadIds()
  }

  const unused = ids.filter(i => !i.isUsed)
  const used   = ids.filter(i => i.isUsed)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">System ID Manager</h1>

      {/* Generate */}
      <div className="bg-gray-900 rounded-xl p-5 mb-6 border border-gray-800">
        <h2 className="text-sm font-bold text-gray-400 uppercase mb-3">Nai IDs Generate Karo</h2>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            min={1} max={100}
            className="w-24 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm"
          />
          <span className="text-gray-500 text-sm">IDs generate karo</span>
          <button
            onClick={generate}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {msg && <p className="text-green-400 text-sm mt-2">{msg}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
          <div className="text-2xl font-black text-white">{ids.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total IDs</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-green-900 text-center">
          <div className="text-2xl font-black text-green-400">{unused.length}</div>
          <div className="text-xs text-gray-500 mt-1">Available</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-red-900 text-center">
          <div className="text-2xl font-black text-red-400">{used.length}</div>
          <div className="text-xs text-gray-500 mt-1">Used</div>
        </div>
      </div>

      {/* Available IDs */}
      {unused.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase mb-3">Available IDs ({unused.length})</h2>
          <div className="flex flex-wrap gap-2">
            {unused.map(id => (
              <div key={id.code} className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
                <span className="text-green-400 font-mono font-bold text-sm">{id.code}</span>
                <button
                  onClick={() => deleteId(id.code)}
                  className="text-red-500 hover:text-red-400 text-xs"
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Used IDs */}
      {used.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase mb-3">Used IDs ({used.length})</h2>
          <div className="flex flex-wrap gap-2">
            {used.map(id => (
              <div key={id.code} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 opacity-50">
                <span className="text-red-400 font-mono text-sm line-through">{id.code}</span>
                <span className="text-gray-600 text-xs ml-2">{id.usedBy}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}