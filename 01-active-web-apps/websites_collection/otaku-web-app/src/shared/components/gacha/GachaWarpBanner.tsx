'use client';

/**
 * Warp-pull banner — WebGPU aurora when available, canvas 2D fallback.
 */
import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from '../../hooks/useMotionPreference';

type Props = {
  active?: boolean;
  className?: string;
};

const WGSL = `
@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  var pos = array<vec2f, 3>(vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3));
  return vec4f(pos[i], 0, 1);
}
@fragment fn fs(@builtin(position) p: vec4f) -> @location(0) vec4f {
  let t = p.x * 0.001 + p.y * 0.001;
  let v = sin(t * 12.0) * 0.5 + 0.5;
  return vec4f(0.45 + v * 0.35, 0.35 + v * 0.2, 0.75 + v * 0.2, 0.35);
}
`;

async function startWebGpuLoop(canvas: HTMLCanvasElement, signal: AbortSignal): Promise<boolean> {
  if (!navigator.gpu) return false;
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return false;
  const device = await adapter.requestDevice();
  const context = canvas.getContext('webgpu');
  if (!context) return false;

  const format = navigator.gpu.getPreferredCanvasFormat();
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    context.configure({ device, format, alphaMode: 'premultiplied' });
  };
  resize();
  window.addEventListener('resize', resize, { signal });

  const module = device.createShaderModule({ code: WGSL });
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vs' },
    fragment: { module, entryPoint: 'fs', targets: [{ format }] },
    primitive: { topology: 'triangle-list' },
  });

  let raf = 0;
  const frame = () => {
    if (signal.aborted) return;
    const encoder = device.createCommandEncoder();
    const view = context.getCurrentTexture().createView();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{ view, loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 0 } }],
    });
    pass.setPipeline(pipeline);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);
    raf = requestAnimationFrame(frame);
  };
  frame();
  signal.addEventListener('abort', () => cancelAnimationFrame(raf));
  return true;
}

function startCanvasLoop(canvas: HTMLCanvasElement, signal: AbortSignal) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize, { signal });

  const particles = Array.from({ length: 48 }, () => ({
    x: Math.random() * canvas.clientWidth,
    y: Math.random() * canvas.clientHeight,
    vx: (Math.random() - 0.5) * 2.4,
    vy: (Math.random() - 0.5) * 2.4,
    hue: 260 + Math.random() * 80,
  }));

  let frame = 0;
  let raf = 0;
  const draw = () => {
    if (signal.aborted) return;
    frame += 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(111, 120, 183, 0.15)');
    grad.addColorStop(1, 'rgba(216, 181, 106, 0.12)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8 + Math.sin(frame * 0.05 + p.hue) * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, 0.85)`;
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  };
  draw();
  signal.addEventListener('abort', () => cancelAnimationFrame(raf));
}

export function GachaWarpBanner({ active = false, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isReduced } = useMotionPreference();
  const [renderer, setRenderer] = useState<'webgpu' | 'canvas' | 'static'>('static');

  useEffect(() => {
    if (isReduced || !active) {
      setRenderer('static');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ac = new AbortController();
    (async () => {
      const ok = await startWebGpuLoop(canvas, ac.signal);
      if (ok) {
        setRenderer('webgpu');
        return;
      }
      startCanvasLoop(canvas, ac.signal);
      setRenderer('canvas');
    })();

    return () => ac.abort();
  }, [active, isReduced]);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 to-amber-950/20 ${className}`}
      aria-hidden={!active}
    >
      {!isReduced && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80 pointer-events-none" />
      )}
      <div className="relative z-10 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-300">
            Astral warp lane
            {renderer === 'webgpu' && (
              <span className="ml-2 text-[9px] text-cyan-300/80 normal-case tracking-normal">WebGPU</span>
            )}
          </p>
          <p className="text-sm text-zinc-300 mt-1">
            {active ? 'Summoning in progress…' : '160 coins · legendary pity not guaranteed'}
          </p>
        </div>
        <div
          className={`h-2 w-24 rounded-full bg-black/40 overflow-hidden ${active ? 'ring-1 ring-amber-400/50' : ''}`}
        >
          <div
            className={`h-full bg-gradient-to-r from-violet-500 to-amber-400 ${active ? 'animate-pulse w-full' : 'w-1/3'}`}
          />
        </div>
      </div>
    </div>
  );
}
