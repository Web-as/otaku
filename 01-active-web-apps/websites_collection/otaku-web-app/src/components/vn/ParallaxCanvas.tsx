'use client';

import React, { useEffect, useRef } from 'react';
// @ts-ignore - Assuming pixi.js and pixi-live2d-display are installed via npm
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';

export interface Live2DConfig {
  url: string;
  xOffset?: number; // relative to center, e.g. -300 for left, 300 for right
  yOffset?: number; // relative to bottom
  scale?: number;
}

export interface ParallaxCanvasProps {
  backgroundImageUrl: string;
  live2dModels?: Live2DConfig[];
}

export function ParallaxCanvas({ backgroundImageUrl, live2dModels = [] }: ParallaxCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Must be exposed to window for live2d plugin to work
    (window as any).PIXI = PIXI;

    // Initialize Pixi Application
    const app = new PIXI.Application({
      resizeTo: window,
      backgroundAlpha: 0,
    });
    
    // Inject into DOM
    containerRef.current.appendChild(app.view as HTMLCanvasElement);

    // 1. Load Parallax Background
    const bgSprite = PIXI.Sprite.from(backgroundImageUrl);
    bgSprite.width = window.innerWidth;
    bgSprite.height = window.innerHeight;
    app.stage.addChild(bgSprite);

    // 2. Load Live2D Characters
    live2dModels.forEach((config) => {
      Live2DModel.from(config.url).then((model: any) => {
        model.scale.set(config.scale || 0.2); 
        
        const baseX = window.innerWidth / 2 - model.width / 2;
        model.x = baseX + (config.xOffset || 0);
        
        const baseY = window.innerHeight - model.height;
        model.y = baseY + (config.yOffset || 50); 
        
        app.stage.addChild(model);

        // Simple idle breathing motion
        app.ticker.add(() => {
          model.update(app.ticker.deltaMS);
        });
      }).catch((e: Error) => console.error(`Failed to load Live2D model from ${config.url}:`, e));
    });

    return () => {
      app.destroy(true, { children: true, texture: true });
    };
  }, [backgroundImageUrl, live2dModels]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
}
