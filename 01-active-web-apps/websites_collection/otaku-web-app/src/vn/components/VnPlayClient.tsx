'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { SceneBlock, SceneChoice } from '@/vn/schema'
import { textToFallbackScene, lineText } from '@/vn/schema'
import { textCommandEngine } from '@/shared/lib/TextCommandEngine'
import { ParallaxCanvas } from '@/vn/components/ParallaxCanvas'
import { Live2DStage } from '@/vn/components/Live2DStage'
import { DialogueBox, useLineIndex } from '@/vn/components/DialogueBox'
import { VnPremiumGate } from '@/vn/components/VnPremiumGate'

interface Props {
  scrollId: string
  episodeNumber?: number
  questBookId?: string
  heroName?: string
  heroClass?: string
}

export function VnPlayClient({
  scrollId,
  episodeNumber = 1,
  questBookId = 'default',
  heroName = 'Hero',
  heroClass = 'Mage',
}: Props) {
  const [scene, setScene] = useState<SceneBlock | null>(null)
  const [loading, setLoading] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [input, setInput] = useState('')
  const { idx, advance } = useLineIndex(scene)

  const loadScene = useCallback(async (playerMessage: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/dm/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerMessage,
          scrollContext: scrollId,
          charName: heroName,
          charClass: heroClass,
        }),
      })
      const data = await res.json()
      setScene(data.sceneBlock ?? textToFallbackScene(playerMessage))
    } catch {
      setScene(textToFallbackScene(playerMessage))
    } finally {
      setLoading(false)
    }
  }, [scrollId, heroName, heroClass])

  useEffect(() => {
    void loadScene(`${heroName} enters the world of ${scrollId}. The prologue begins.`)
  }, [loadScene, heroName, scrollId])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2
      const ny = (e.clientY / window.innerHeight - 0.5) * 2
      setMouse({ x: nx, y: ny })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const currentLine = scene?.dialogue_lines[idx] ?? null
  const atLast = scene ? idx >= scene.dialogue_lines.length - 1 : true

  const handleChoice = (c: SceneChoice) => {
    void loadScene(c.action ?? c.label)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const raw = input.trim()
    const intent = textCommandEngine.parseInput(raw)
    const hint = textCommandEngine.executeHint(intent)
    if (hint && intent.action === 'UNKNOWN') {
      setScene(textToFallbackScene(`[System] ${hint}`))
      setInput('')
      return
    }
    const enriched =
      intent.action !== 'UNKNOWN' && intent.targetItemName
        ? `[${intent.action} ${intent.targetItemName}] ${raw}`
        : raw
    void loadScene(enriched)
    setInput('')
  }

  if (!scene) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  const live2d = scene.live2d_models?.[0]
  const stageSprites = scene.stage_sprites?.filter(sp => sp.visible) ?? []
  const showStageSprites = stageSprites.length > 0

  return (
    <VnPremiumGate episodeNumber={episodeNumber} questBookId={questBookId}>
      <div className="relative min-h-screen overflow-hidden bg-black select-none">
        <ParallaxCanvas scene={scene} mouseX={mouse.x} mouseY={mouse.y} />

        {showStageSprites ? stageSprites.map(sp => (
          <Live2DStage
            key={sp.slot}
            slot={sp.slot}
            spriteId={sp.sprite}
            animationState={sp.animation_state}
          />
        )) : (
          <Live2DStage
            spriteId={currentLine?.sprite ?? undefined}
            modelId={live2d?.model_id}
            moc3Url={live2d?.moc3_url}
            animationState={currentLine ? undefined : 'neutral'}
          />
        )}

        <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-black/70 to-transparent flex justify-between">
          <span className="text-[10px] uppercase tracking-widest text-gray-400">{scrollId}</span>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
        </header>

        <DialogueBox
          line={currentLine}
          choices={atLast ? scene.choices : undefined}
          onAdvance={advance}
          onChoice={handleChoice}
          canAdvance={!loading}
        />

        <form onSubmit={handleSubmit} className="absolute bottom-4 left-4 right-4 md:right-80 z-40 max-w-xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder="What do you do?"
            className="flex-1 rounded-xl border border-white/10 bg-black/70 px-4 py-2 text-sm text-white"
          />
          <button type="submit" disabled={loading || !input.trim()} className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-sm disabled:opacity-40">
            ▶
          </button>
        </form>
      </div>
    </VnPremiumGate>
  )
}
