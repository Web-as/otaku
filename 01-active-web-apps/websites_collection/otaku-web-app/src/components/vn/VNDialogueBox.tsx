'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DialogueChoice {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  isAction?: boolean; // E.g., "Add to Library" vs just conversational text
}

export interface VNDialogueBoxProps {
  speakerName: string;
  text: string;
  choices?: DialogueChoice[];
  mood?: 'neutral' | 'happy' | 'angry' | 'surprised' | 'scared';
  allowInput?: boolean;
  onInputSubmit?: (text: string) => void;
  onNext?: () => void;
}

export function VNDialogueBox({ 
  speakerName, 
  text, 
  choices = [], 
  mood = 'neutral',
  allowInput = false,
  onInputSubmit,
  onNext 
}: VNDialogueBoxProps) {
  const [inputText, setInputText] = React.useState('');
  const [displayedText, setDisplayedText] = React.useState('');
  
  // Phase 3 Mitigation: Formidable Reading Rate Typewriter Buffer
  // Even if the backend streams text instantly, we pace it out at a readable speed 
  // (e.g. 30ms per character) to mask background calculations and ensure immersion.
  React.useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputText.trim()) {
      onInputSubmit?.(inputText);
      setInputText('');
    }
  };

  const isTyping = displayedText.length < text.length;

  return (
    <div className="absolute bottom-0 left-0 w-full p-6 z-[90] flex justify-center">
      <div className="w-full max-w-5xl relative flex flex-col gap-4">
        
        {/* Speaker Name Badge */}
        <div className="absolute -top-8 left-4 px-6 py-2 bg-dark-bg border-2 border-brand-cyan-neon text-brand-cyan-neon font-display font-bold text-xl rounded-t-sm z-10 shadow-glow-cyan">
          {speakerName}
        </div>

        {/* Main Dialogue Panel */}
        <div 
          onClick={() => {
            if (isTyping) {
              // Click to skip typewriter
              setDisplayedText(text);
            } else if (choices.length === 0 && !allowInput) {
              onNext?.();
            }
          }}
          className={`
            glass-panel inked-outline rounded-sm p-8 min-h-[160px] cursor-pointer relative
            vn-dialogue-animated vn-mood-${mood}
          `}
        >
          <p className="text-xl leading-relaxed text-gray-50 font-sans tracking-wide">
            {displayedText}
          </p>

          {/* Continue indicator - only show when typing is done */}
          {!isTyping && choices.length === 0 && !allowInput && (
            <motion.div 
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="absolute bottom-4 right-6 text-brand-cyan-neon font-bold text-2xl"
            >
              ▼
            </motion.div>
          )}
        </div>

        {/* Player Free Text Input for NLP Parser */}
        {allowInput && (
          <div className="w-full flex items-center gap-4">
            <div className="flex-1 inked-outline bg-dark-bgSecondary p-2 rounded-sm shadow-glow-cyan">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you want to do? (e.g. 'I want to drink my potion')"
                className="w-full bg-transparent border-none outline-none text-white font-sans text-lg px-4"
              />
            </div>
            <button 
              onClick={() => {
                if(inputText.trim()) {
                  onInputSubmit?.(inputText);
                  setInputText('');
                }
              }}
              className="px-6 py-3 bg-brand-cyan-neon text-dark-bg font-bold inked-outline rounded-sm shadow-glow-cyan hover:bg-cyan-400"
            >
              Send Action
            </button>
          </div>
        )}

        {/* Choices / Hyperlinks */}
        {choices.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 items-end">
            <AnimatePresence>
              {choices.map((choice, i) => (
                <motion.div
                  key={choice.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <button
                    onClick={choice.onClick}
                    className={`
                      px-6 py-3 inked-outline rounded-sm font-bold text-lg text-right min-w-[300px] transition-all
                      ${choice.isAction 
                        ? 'bg-brand-magenta-neon text-dark-bg hover:bg-magenta-400 shadow-glow-magenta' 
                        : 'glass-panel text-brand-cyan-neon hover:bg-dark-border shadow-glow-cyan'
                      }
                    `}
                  >
                    {choice.label}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
