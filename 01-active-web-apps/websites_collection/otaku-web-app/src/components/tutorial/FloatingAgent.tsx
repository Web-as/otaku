'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import DmFriend from '../DmFriend';



// Reusable mini Live2D canvas (Disabled temporarily due to PIXI v8 incompatibility)
function Live2DChibiCanvas() {
  return (
    <div className="w-[120px] h-[120px] flex items-center justify-center text-brand-cyan-neon font-bold text-4xl">
      ?
    </div>
  );
}



export function FloatingAgent() {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const pathname = usePathname();

  // On VN routes, we hide the agent entirely for immersion
  const isHidden = pathname?.startsWith('/vn');

  if (isHidden) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4 pointer-events-none"
      >
        {/* Agent UI Panel (DM Friend) */}
        <AnimatePresence>
          {isAgentOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto origin-bottom-right"
            >
              <DmFriend />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chibi Character Toggle */}
        <div 
          className="relative group cursor-pointer pointer-events-auto animate-bounce duration-[3000ms]"
          onClick={() => setIsAgentOpen(!isAgentOpen)}
        >
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-brand-cyan-neon to-brand-magenta-neon p-1 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,255,0.4)] transition-transform hover:scale-105">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden relative">
               <div className="absolute inset-0 flex items-center justify-center pt-6">
                 <Live2DChibiCanvas />
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
