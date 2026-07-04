"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NPCOnboardingChatProps {
  npcType: 'librarian' | 'dm_friend';
  onClose: () => void;
}

const NPCOnboardingChat: React.FC<NPCOnboardingChatProps> = ({ npcType, onClose }) => {
  const { user, setAuthModalOpen } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    sendMessage([
      { role: 'user', content: 'Who are you and why is this area restricted?' }
    ], true);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageHistory: Message[], isInitial = false) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/npc/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messageHistory, 
          npcType,
          userProfile: user ? { tier: user.tier, created_at: user.created_at, role: user.role } : null
        })
      });
      
      const data = await response.json();
      setMessages([...messageHistory, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages([...messageHistory, { role: 'assistant', content: "The connection to the arcane network is unstable right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    sendMessage(newMessages);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className={`glass-card rounded-2xl w-full max-w-lg overflow-hidden flex flex-col h-[600px] max-h-[90vh] shadow-2xl animate-in zoom-in slide-in-from-bottom-8 ${
        npcType === 'dm_friend' ? 'border-[#d8b56a]' : 'border-brand-magenta-neon'
      }`}>
        
        {/* Header */}
        <div className={`p-4 border-b flex justify-between items-center ${
          npcType === 'dm_friend' ? 'bg-[#1a1710] border-[#d8b56a]/30' : 'bg-[#13111c] border-brand-magenta-neon/30'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              npcType === 'dm_friend' ? 'bg-[#d8b56a]/20 text-[#d8b56a]' : 'bg-brand-magenta-neon/20 text-brand-magenta-neon'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-bold uppercase tracking-wider ${
                npcType === 'dm_friend' ? 'text-[#d8b56a]' : 'text-brand-magenta-neon'
              }`}>
                {npcType === 'librarian' ? 'The Librarian' : 'DM Friend'}
              </h3>
              <p className="text-xs text-gray-400">AI Concierge</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0c]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl p-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-gray-800 text-white' 
                  : (npcType === 'dm_friend' ? 'bg-[#1a1710] border border-[#d8b56a]/30 text-[#d8b56a]' : 'bg-brand-magenta-neon/10 border border-brand-magenta-neon/30 text-white')
              }`}>
                {/* Hide the initial programmatic user prompt */}
                {msg.role === 'user' && idx === 0 ? "*(Approaches)*" : msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-900 rounded-xl p-3 flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Upgrade Prompt / Input */}
        <div className="p-4 bg-[#050505] border-t border-gray-800">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about access..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-lg transition disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <button 
              onClick={() => {
                onClose();
                setAuthModalOpen(true);
              }}
              className={`block w-full py-2 rounded-lg font-bold uppercase tracking-wider text-xs transition shadow-lg ${
                npcType === 'dm_friend' 
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-yellow-900/50' 
                  : 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-violet-900/50'
              }`}
            >
              Get {npcType === 'dm_friend' ? 'VIP Access' : 'Library Card'} Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPCOnboardingChat;
