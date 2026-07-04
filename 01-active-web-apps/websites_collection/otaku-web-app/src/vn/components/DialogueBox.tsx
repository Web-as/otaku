'use client'

import { useEffect, useState, useCallback } from 'react'
import type { DialogueLine, SceneBlock, SceneChoice } from '@/vn/schema'
import { lineAnimation, lineText } from '@/vn/schema'

interface Props {
  line: DialogueLine | null
  choices?: SceneChoice[]
  onAdvance: () => void
  onChoice: (c: SceneChoice) => void
  canAdvance: boolean
}

export function DialogueBox({ line, choices, onAdvance, onChoice, canAdvance }: Props) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!line) { setDisplayed(''); setDone(true); return }
    setDisplayed('')
    setDone(false)
    const full = lineText(line)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(full.slice(0, i))
      if (i >= full.length) { clearInterval(id); setDone(true) }
    }, 26)
    return () => clearInterval(id)
  }, [line])

  const skip = useCallback(() => {
    if (!line) return
    if (!done) { setDisplayed(lineText(line)); setDone(true) }
    else if (canAdvance && !choices?.length) onAdvance()
  }, [line, done, canAdvance, choices, onAdvance])

  if (!line) return null

  const anim = lineAnimation(line)

  const moodClass =
    anim === 'angry'
      ? 'vn-dialogue-animated vn-mood-angry'
      : anim === 'scared'
        ? 'vn-mood-scared'
        : anim === 'happy'
          ? 'vn-mood-happy'
          : anim === 'surprised'
            ? 'vn-mood-surprised'
            : ''

  return (
    <div className="absolute bottom-0 left-0 right-0 md:right-72 z-30 p-4 cursor-pointer" onClick={skip}>
      <div className={`mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/55 backdrop-blur-xl px-6 py-5 shadow-2xl ${moodClass}`}>
        <p className="text-xs font-bold uppercase tracking-widest text-purple-300 mb-1">
          {line.speaker}
          <span className="ml-2 text-gray-500 font-normal normal-case">({anim})</span>
        </p>
        <p className="text-lg text-gray-100 leading-relaxed min-h-[3rem]">{displayed}{!done && <span className="animate-pulse">▌</span>}</p>
        {done && choices && choices.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {choices.map(c => (
              <button key={c.id} type="button" onClick={e => { e.stopPropagation(); onChoice(c) }}
                className="px-4 py-2 rounded-lg border border-amber-600/40 bg-amber-900/30 text-amber-100 text-sm hover:bg-amber-800/40">
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function useLineIndex(scene: SceneBlock | null) {
  const [idx, setIdx] = useState(0)
  useEffect(() => { setIdx(0) }, [scene?.scene_id])
  return { idx, advance: () => setIdx(i => i + 1) }
}
