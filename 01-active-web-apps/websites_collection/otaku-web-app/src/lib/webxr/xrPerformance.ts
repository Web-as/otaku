export type GPUTier = 'low' | 'mid' | 'high';

export interface XRRenderingConfig {
  pixelRatio: number;
  shadows: boolean;
  shadowMapSize: number;
  postProcessing: boolean;
  maxInstancedCount: number;
}

export function detectGPUTier(gl: WebGLRenderingContext | WebGL2RenderingContext): GPUTier {
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) return 'mid'; // Default to mid if we can't tell

  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

  // Simple heuristic for GPU tier
  if (renderer.includes('adreno') || renderer.includes('mali') || renderer.includes('intel') || renderer.includes('apple a')) {
    if (renderer.includes('apple a1') || renderer.includes('adreno 6') || renderer.includes('adreno 7')) {
      return 'mid';
    }
    return 'low';
  }
  
  if (renderer.includes('nvidia') || renderer.includes('amd') || renderer.includes('radeon') || renderer.includes('apple m')) {
    return 'high';
  }

  return 'mid';
}

export function getXRRenderingConfig(tier: GPUTier, isXRActive: boolean): XRRenderingConfig {
  // In XR, we need higher frame rates (72-90Hz), so we dial back quality compared to flat screen
  if (isXRActive) {
    switch (tier) {
      case 'high':
        return { pixelRatio: 1.5, shadows: true, shadowMapSize: 1024, postProcessing: true, maxInstancedCount: 1000 };
      case 'mid':
        return { pixelRatio: 1.0, shadows: false, shadowMapSize: 512, postProcessing: false, maxInstancedCount: 500 };
      case 'low':
      default:
        return { pixelRatio: 0.8, shadows: false, shadowMapSize: 256, postProcessing: false, maxInstancedCount: 200 };
    }
  } else {
    // Flat screen can handle better graphics
    switch (tier) {
      case 'high':
        return { pixelRatio: 2.0, shadows: true, shadowMapSize: 2048, postProcessing: true, maxInstancedCount: 2000 };
      case 'mid':
        return { pixelRatio: 1.5, shadows: true, shadowMapSize: 1024, postProcessing: true, maxInstancedCount: 1000 };
      case 'low':
      default:
        return { pixelRatio: 1.0, shadows: false, shadowMapSize: 512, postProcessing: false, maxInstancedCount: 500 };
    }
  }
}
