'use client'

import { useState } from 'react'
import { Save, Trash2 } from 'lucide-react'

/** Quest Log / BBEG editor — ported from Admin.tsx blog CMS pattern (Phase 7). */
export interface QuestLogDraft {
  logId: string
  title: string
  arcType: string
  bbegName: string
  bbegDc: number
  theme: string
  scrollIds: string[]
}

const EMPTY: QuestLogDraft = {
  logId: '',
  title: '',
  arcType: 'Tournament Arc',
  bbegName: '',
  bbegDc: 15,
  theme: '',
  scrollIds: [''],
}

export function QuestLogBuilder() {
  const [draft, setDraft] = useState<QuestLogDraft>(EMPTY)
  const [saved, setSaved] = useState<QuestLogDraft[]>([])
  const [status, setStatus] = useState('')

  const update = (patch: Partial<QuestLogDraft>) => setDraft(d => ({ ...d, ...patch }))

  const handleSave = () => {
    if (!draft.title.trim()) {
      setStatus('Title required')
      return
    }
    const entry = { ...draft, logId: draft.logId || `log_${Date.now()}` }
    setSaved(s => [...s.filter(x => x.logId !== entry.logId), entry])
    setStatus(`Saved "${entry.title}"`)
    setDraft(EMPTY)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ questLogs: saved }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'quest_logs.json'
    a.click()
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-amber-200">Quest Log Builder</h1>
        <p className="text-sm text-gray-500 mt-1">Define story arcs, BBEG, and episode scrolls for the Anime D&D schema.</p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="text-gray-400">Arc Title</span>
            <input value={draft.title} onChange={e => update({ title: e.target.value })}
              className="mt-1 w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white" />
          </label>
          <label className="block text-sm">
            <span className="text-gray-400">Arc Type</span>
            <input value={draft.arcType} onChange={e => update({ arcType: e.target.value })}
              className="mt-1 w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white" />
          </label>
          <label className="block text-sm">
            <span className="text-gray-400">BBEG Name</span>
            <input value={draft.bbegName} onChange={e => update({ bbegName: e.target.value })}
              className="mt-1 w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white" />
          </label>
          <label className="block text-sm">
            <span className="text-gray-400">Boss DC</span>
            <input type="number" min={1} max={30} value={draft.bbegDc} onChange={e => update({ bbegDc: +e.target.value })}
              className="mt-1 w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-gray-400">Theme / Tags</span>
          <textarea value={draft.theme} onChange={e => update({ theme: e.target.value })} rows={3}
            className="mt-1 w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white" />
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-black font-bold text-sm">
            <Save className="w-4 h-4" /> Save Quest Log
          </button>
          <button type="button" onClick={exportJson} disabled={!saved.length}
            className="px-4 py-2 rounded-lg border border-white/20 text-sm text-gray-300 disabled:opacity-40">
            Export JSON
          </button>
        </div>
        {status && <p className="text-xs text-emerald-400">{status}</p>}
      </div>

      {saved.length > 0 && (
        <ul className="space-y-2">
          {saved.map(log => (
            <li key={log.logId} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <div>
                <p className="font-semibold text-gray-200">{log.title}</p>
                <p className="text-xs text-gray-500">{log.arcType} · BBEG: {log.bbegName} DC{log.bbegDc}</p>
              </div>
              <button type="button" onClick={() => setSaved(s => s.filter(x => x.logId !== log.logId))} className="text-red-400 p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
