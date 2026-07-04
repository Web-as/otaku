'use client'

import { useEffect, useRef } from 'react'
import type { SceneBlock } from '@/vn/schema'
import { assetUrl, defaultParallax } from '@/vn/assetRegistry'

interface Props {
  scene: SceneBlock
  mouseX?: number
  mouseY?: number
}

/** PixiJS parallax world — 3 layers + optional particles (Phase 4). */
export function ParallaxCanvas({ scene, mouseX = 0, mouseY = 0 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => {
    let cancelled = false
    const host = hostRef.current
    if (!host) return

    void (async () => {
      const PIXI = await import('pixi.js')
      if (cancelled || !hostRef.current) return

      appRef.current?.destroy()
      const app = new PIXI.Application()
      await app.init({
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: true,
      })
      if (cancelled) {
        app.destroy()
        return
      }

      host.innerHTML = ''
      host.appendChild(app.canvas as HTMLCanvasElement)
      appRef.current = app

      const layers = scene.parallax_layers?.length
        ? scene.parallax_layers
        : defaultParallax(scene.background)

      const containers: InstanceType<typeof PIXI.Container>[] = []
      for (const layer of layers) {
        const c = new PIXI.Container()
        const { url, gradient } = assetUrl(layer.asset_id)
        const g = new PIXI.Graphics()
        g.rect(0, 0, app.screen.width, app.screen.height)
        g.fill({ color: 0x111118 })
        c.addChild(g)

        try {
          const tex = await PIXI.Assets.load(url)
          const spr = new PIXI.Sprite(tex)
          spr.width = app.screen.width
          spr.height = app.screen.height
          spr.alpha = layer.layer === 'foreground' ? 0.35 : layer.layer === 'midground' ? 0.65 : 1
          c.addChild(spr)
        } catch {
          /* gradient fallback via CSS layer below */
        }
        app.stage.addChild(c)
        containers.push(c)
      }

      // Particles
      if (scene.particles && scene.particles !== 'none') {
        const count = scene.particles === 'rain' ? 120 : 60
        const color = scene.particles === 'magic_dust' ? 0xa78bfa : 0x8888aa
        for (let i = 0; i < count; i++) {
          const p = new PIXI.Graphics()
          p.circle(0, 0, scene.particles === 'rain' ? 1.5 : 2)
          p.fill({ color })
          p.x = Math.random() * app.screen.width
          p.y = Math.random() * app.screen.height
          app.stage.addChild(p)
          app.ticker.add(() => {
            p.y += scene.particles === 'rain' ? 4 + Math.random() * 3 : 0.5
            if (p.y > app.screen.height) p.y = -5
          })
        }
      }

      app.ticker.add(() => {
        containers.forEach((c, i) => {
          const factor = layers[i]?.scroll_factor ?? 0.2
          c.x = mouseX * factor * 40
          c.y = mouseY * factor * 20
        })
      })
    })()

    return () => {
      cancelled = true
      appRef.current?.destroy()
      appRef.current = null
    }
  }, [scene.scene_id, scene.background, scene.particles, mouseX, mouseY])

  const { gradient } = assetUrl(scene.background)

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: gradient }}>
      <div ref={hostRef} className="absolute inset-0" />
    </div>
  )
}
