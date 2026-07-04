import React, { useState, useEffect } from 'react';

export default function DmFriend() {
  const [messages, setMessages] = useState<{role: 'dm'|'user'|'system', text: string}[]>([
    { role: 'dm', text: "Greetings, traveler! I am the Game Master. What quest seek ye?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playerSheet, setPlayerSheet] = useState<any>(null);

  useEffect(() => {
    fetchSheet();
  }, []);

  const fetchSheet = async () => {
    try {
      const res = await fetch('http://localhost:3333/api/game/sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer DUMMY_TOKEN`
        }
      });
      const data = await res.json();
      if (data.sheet) {
        setPlayerSheet(data.sheet);
        if (data.sheet.dm_notes && data.sheet.dm_notes.status === 'pending') {
          setMessages(prev => [...prev, { 
            role: 'system', 
            text: `The DM proposes an update to your sheet: ${data.sheet.dm_notes.reasoning}`
          }]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const acceptSheet = async () => {
    try {
      const res = await fetch('http://localhost:3333/api/game/accept-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer DUMMY_TOKEN`
        }
      });
      const data = await res.json();
      if (data.ok) {
        setMessages(prev => [...prev, { role: 'system', text: "Player Sheet updated successfully!" }]);
        setPlayerSheet({ ...playerSheet, official_sheet: data.official_sheet, dm_notes: null });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // 1. Call Librarian AI
      const res = await fetch('http://localhost:3333/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer DUMMY_TOKEN` // In real app, use Firebase auth token
        },
        body: JSON.stringify({ question: currentInput, context: { playerLevel: 5 } })
      });
      const data = await res.json();
      
      if (data.answer) {
        setMessages(prev => [...prev, { role: 'dm', text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: 'dm', text: "The arcane energies failed to respond." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'dm', text: "A glitch in the matrix occurred." }]);
    }
    setLoading(false);
  };

  const rollGacha = async () => {
    try {
      const res = await fetch('http://localhost:3333/api/gacha/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'dummy_user_123' })
      });
      const data = await res.json();
      if (data.item) {
        setMessages(prev => [...prev, { role: 'dm', text: `You rolled the zkML Gacha and received: ${data.item.name} (Rarity: ${data.item.rarity})!` }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'dm', text: "The Gacha gods deny your roll." }]);
    }
  };

  return (
    <div className="theme-glass-modal p-4 flex flex-col h-full h-[500px] w-[350px] relative overflow-hidden shadow-2xl border-[var(--anime-cyan)]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--anime-gold)] via-[var(--anime-neon-violet)] to-[var(--anime-cyan)]"></div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="anime-text-h4 font-bold text-[var(--anime-neon-violet)]">DM Friend Link</h3>
        <span className="theme-badge-premium">
          Lvl {playerSheet?.official_sheet?.level || 1} {playerSheet?.official_sheet?.class || 'Novice'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-xl max-w-[85%] text-sm 
              ${msg.role === 'user' ? 'bg-[var(--anime-neon-violet)]/20 border border-[var(--anime-neon-violet)]/40 text-[var(--anime-text-body)]' : 
                msg.role === 'system' ? 'bg-[var(--anime-gold)]/20 border border-[var(--anime-gold)]/40 text-[var(--anime-gold)] font-bold' :
                'theme-card text-[var(--anime-text-muted)]'}`}>
              {msg.text}
              {msg.role === 'system' && msg.text.includes('proposes an update') && (
                <button onClick={acceptSheet} className="mt-2 block bg-[var(--anime-gold)] text-black px-3 py-1 rounded text-xs font-bold w-full hover:bg-yellow-400">
                  Accept Update
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-xl max-w-[85%] text-sm theme-card text-[var(--anime-text-muted)] animate-pulse">
              The GM is pondering the orb...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-2">
        <button onClick={rollGacha} className="theme-cta-secondary text-xs w-full">Roll Daily Gacha</button>
      </div>

      <div className="flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-[var(--anime-bg-deep)] border border-[var(--anime-hud-border)] rounded-lg px-3 py-2 text-sm text-[var(--anime-text-body)] focus:outline-none focus:border-[var(--anime-cyan)]"
          placeholder="Speak to the GM..."
        />
        <button onClick={handleSend} className="theme-cta-primary px-4 py-2 text-sm">Send</button>
      </div>
    </div>
  );
}
