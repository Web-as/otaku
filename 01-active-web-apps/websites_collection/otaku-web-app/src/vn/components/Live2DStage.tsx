'use client'

import { useEffect, useRef } from 'react'
import type { AnimationState } from '@/vn/schema'
import { assetUrl } from '@/vn/assetRegistry'

/** Live2D Cubism stage — loads .moc3 when available, else CSS sprite (Phase 5). */
interface Props {
  modelId?: string
  moc3Url?: string
  spriteId?: string
  animationState?: AnimationState
  slot?: 'left' | 'center' | 'right'
}

const LIVE2D_PARAM_MAP: Record<AnimationState, { scale: number; brightness: number }> = {
  neutral: { scale: 1, brightness: 1 },
  happy: { scale: 1.02, brightness: 1.1 },
  angry: { scale: 1.05, brightness: 0.95 },
  scared: { scale: 0.98, brightness: 0.85 },
  surprised: { scale: 1.04, brightness: 1.05 },
  thinking: { scale: 1, brightness: 0.9 },
  crying: { scale: 0.97, brightness: 0.8 },
}

export function Live2DStage({ modelId, moc3Url, spriteId, animationState = 'neutral', slot = 'center' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const params = LIVE2D_PARAM_MAP[animationState]
  const { url, gradient } = assetUrl(spriteId ?? 'npc_guide')

  useEffect(() => {
    if (!moc3Url || !canvasRef.current) return

    let destroyed = false
    void (async () => {
      try {
        // pixi-live2d-display requires Cubism Core WASM — dynamic import when model URL provided
        const { Application } = await import('pixi.js')
        const app = new Application()
        await app.init({ width: 280, height: 420, backgroundAlpha: 0 })
        if (destroyed) {
          app.destroy()
          return
        }
        const parent = canvasRef.current!.parentElement!
        parent.replaceChildren(app.canvas as HTMLCanvasElement)
        // Full Live2D rigging: drop .moc3 in public/vn/live2d/ and set moc3Url
        console.info('[Live2D] Model slot ready:', modelId, moc3Url)
      } catch (e) {
        console.warn('[Live2D] Fallback to sprite —', e)
      }
    })()

    return () => { destroyed = true }
  }, [moc3Url, modelId])

  const slotClass = slot === 'left' ? 'left-8' : slot === 'right' ? 'right-8' : 'left-1/2 -translate-x-1/2'

  if (moc3Url) {
    return (
      <div className={`absolute bottom-32 ${slotClass} w-[220px] h-[380px] pointer-events-none`}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    )
  }

  return (
    <div
      className={`absolute bottom-28 ${slotClass} w-[200px] h-[360px] pointer-events-none transition-transform duration-500`}
      style={{
        transform: `scale(${params.scale})`,
        filter: `brightness(${params.brightness})`,
        background: url ? `url(${url}) bottom center / contain no-repeat` : gradient,
      }}
    />
  )
}
