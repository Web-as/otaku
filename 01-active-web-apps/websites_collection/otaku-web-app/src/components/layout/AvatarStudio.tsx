import React, { useState } from 'react';
import { useLocalEngine } from '@/hooks/useLocalEngine';
import { Sparkles, Download, AlertTriangle, Wand2 } from 'lucide-react';

export default function AvatarStudio() {
  const { connected, status, hardware, checkEngine } = useLocalEngine();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [layerImage, setLayerImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!connected) return;
    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:8188/generate/avatar-layer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, layer_type: 'tattoo' })
      });
      
      if (!res.ok) {
        throw new Error('Generation failed (mock endpoint)');
      }
      
      const blob = await res.blob();
      setLayerImage(URL.createObjectURL(blob));
    } catch (e) {
      console.warn('Backend generation mock caught:', e);
      // For demo purposes, we'll just set a mock transparent placeholder if the backend isn't actually running diffusers
      setLayerImage('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><circle cx="100" cy="100" r="50" fill="purple" opacity="0.5"/></svg>');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-amber-400" /> High-Mage Avatar Studio
        </h1>
        <button onClick={checkEngine} className="text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-1 rounded">
          Re-scan Hardware
        </button>
      </div>

      {!connected ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex items-start gap-4">
          <AlertTriangle className="text-red-400 w-8 h-8 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-red-400 mb-2">Insufficient Mana (Local Engine Not Found)</h2>
            <p className="text-gray-300 text-sm mb-4">
              Your browser cannot handle live AI generation without crashing. To unlock your true visual form and use your local GPU, you must wield the <strong>Desktop Launcher (Portal to the Universe)</strong>.
            </p>
            <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg font-bold transition shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Download className="w-4 h-4" /> Download Portal to the Universe
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <h2 className="text-lg font-bold text-emerald-400 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Local Engine Connected!
          </h2>
          <p className="text-sm text-gray-300 mb-2">
            Hardware detected: <span className="text-white font-bold">{hardware?.gpu} ({hardware?.vram_mb} MB VRAM)</span>
          </p>
          <p className="text-sm text-emerald-200">
            Tier: {hardware?.tier === 'high_mage' ? 'High Mage (Max Settings Unlocked)' : 'Standard'}
          </p>
        </div>
      )}

      {/* The Avatar Canvas Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative aspect-square bg-gray-900 rounded-xl border border-gray-700 overflow-hidden flex items-center justify-center">
          {/* Base Body Layer (Mock) */}
          <div className="absolute inset-0 bg-[url('https://via.placeholder.com/512/333/fff?text=Base+Anime+Body')] bg-cover opacity-50 mix-blend-screen" />
          
          {/* Dynamically Generated Layer */}
          {layerImage && (
            <img src={layerImage} alt="Generated Layer" className="absolute inset-0 w-full h-full object-cover z-10" />
          )}
          
          {!layerImage && (
            <p className="text-gray-500 z-10 font-bold tracking-widest uppercase">Canvas Empty</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Tattoo Parlor</h3>
          <p className="text-sm text-gray-400">Describe the tattoo you want. The AI will draw it and apply it to your body.</p>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!connected || isGenerating}
            placeholder={connected ? "e.g., A glowing red dragon seal..." : "Connect Local Engine first..."}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none resize-none disabled:opacity-50"
            rows={4}
          />
          
          <button
            onClick={handleGenerate}
            disabled={!connected || isGenerating || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="animate-pulse">Conjuring...</span>
            ) : (
              <>
                <Wand2 className="w-5 h-5" /> Generate Avatar Layer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
