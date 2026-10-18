'use client'

import { useState } from 'react'
import { Ghost, Eye, EyeOff } from 'lucide-react'

export default function GhostMode() {
  const [enabled, setEnabled] = useState(false)

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
            enabled ? 'bg-purple-950/50 border-purple-700' : 'bg-gray-800 border-gray-700'
          }`}>
            <Ghost size={16} className={enabled ? 'text-purple-400' : 'text-gray-500'} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Ghost Mode</h3>
            <p className="text-xs text-gray-500">Anonymous collaboration</p>
          </div>
        </div>

        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            enabled ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${
              enabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
        enabled
          ? 'bg-purple-950/20 border-purple-800/50 text-purple-300'
          : 'bg-gray-800/30 border-gray-700/50 text-gray-500'
      }`}>
        {enabled ? <EyeOff size={14} /> : <Eye size={14} />}
        <span className="text-xs font-medium">
          {enabled
            ? 'Ghost Mode is On — your identity is hidden from peers during collaborative sessions.'
            : 'Ghost Mode is Off — your name and avatar are visible to others.'
          }
        </span>
      </div>
    </div>
  )
}
