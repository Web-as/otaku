'use client';
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'lt', label: 'Lietuvių (Lithuanian)' },
];

export function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative group inline-block">
      <button className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-md transition-colors text-white">
        <Globe size={20} />
        <span className="hidden sm:inline text-sm font-medium">
          {LANGUAGES.find(l => l.code === lang)?.label || 'English'}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="py-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                lang === l.code 
                  ? 'bg-indigo-500/20 text-indigo-400' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
