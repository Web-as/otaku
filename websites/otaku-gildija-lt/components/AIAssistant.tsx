import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Terminal, ChevronRight, Minimize2, ExternalLink, Brain, Zap } from 'lucide-react';
import { nexusAgent } from '../services/aiAgent';
import LoadingSpinner from './LoadingSpinner';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'init', text: "NEXUS-7 Online. Database link established. How may I assist you with your collection today?", sender: 'bot', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [useDeepThink, setUseDeepThink] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isThinking) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsThinking(true);

        try {
            // Check for special "fast query" prefix or just use toggle
            let responseText;
            if (!useDeepThink && inputValue.startsWith("/fast ")) {
                 responseText = await nexusAgent.quickQuery(inputValue.replace("/fast ", ""));
            } else {
                 responseText = await nexusAgent.sendMessage(userMsg.text, useDeepThink);
            }
            
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "Error: Connection interrupted.",
                sender: 'bot',
                timestamp: new Date()
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    // Render formatted text (very basic markdown-like support for bullet points)
    const renderText = (text: string) => {
        return text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
                {line}
                <br />
            </React.Fragment>
        ));
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-violet-600 to-pink-600 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)] flex items-center justify-center text-white hover:scale-110 transition-transform group border border-white/20"
                title="Open NEXUS-7 Assistant"
            >
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 animate-ping"></div>
                <Bot className="w-7 h-7" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[90vw] max-w-[400px] h-[600px] max-h-[80vh] flex flex-col font-sans animate-in fade-in slide-in-from-bottom-10 duration-300">
            {/* Holographic Container */}
            <div className="relative w-full h-full bg-gray-900/95 backdrop-blur-xl border border-violet-500/50 rounded-lg shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-900/50 to-gray-900 border-b border-violet-500/30">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/50 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-violet-300" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white italic tracking-wider">NEXUS-7</h3>
                            <div className="flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] text-gray-400 font-mono uppercase">Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-sm text-gray-400 hover:text-white transition">
                            <Minimize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-violet-900 scrollbar-track-transparent">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed relative ${
                                msg.sender === 'user' 
                                    ? 'bg-pink-600/20 border border-pink-500/50 text-white rounded-tr-none' 
                                    : 'bg-violet-900/20 border border-violet-500/30 text-gray-200 rounded-tl-none'
                            }`}>
                                {/* Decorator Line */}
                                <div className={`absolute top-0 w-3 h-[1px] ${msg.sender === 'user' ? '-right-1 bg-pink-500' : '-left-1 bg-violet-500'}`}></div>
                                
                                {msg.sender === 'bot' && (
                                    <div className="mb-1 text-[10px] font-mono text-violet-400 uppercase tracking-widest flex items-center">
                                        <Terminal className="w-3 h-3 mr-1" /> System Response
                                    </div>
                                )}
                                
                                <div className="font-light">{renderText(msg.text)}</div>
                                <div className="mt-1 text-[9px] text-gray-500 text-right opacity-70">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isThinking && (
                        <div className="flex justify-start">
                             <div className="bg-violet-900/10 border border-violet-500/20 rounded-lg p-3 rounded-tl-none flex items-center space-x-2">
                                <Sparkles className="w-4 h-4 text-violet-400 animate-spin" />
                                <span className="text-xs text-violet-300 font-mono animate-pulse">Processing Query...</span>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Controls */}
                <div className="px-4 pb-2 flex items-center gap-2">
                    <button 
                        onClick={() => setUseDeepThink(!useDeepThink)}
                        className={`flex items-center px-2 py-1 rounded text-[9px] font-bold uppercase border transition-all ${useDeepThink ? 'bg-violet-600 text-white border-violet-500' : 'bg-gray-800 text-gray-500 border-gray-700'}`}
                    >
                        <Brain className="w-3 h-3 mr-1" /> Thinking: {useDeepThink ? 'ON' : 'OFF'}
                    </button>
                    <span className="text-[9px] text-gray-600 font-mono">|</span>
                    <span className="text-[9px] text-gray-600 font-mono flex items-center">
                        <Zap className="w-3 h-3 mr-1 text-yellow-500" /> Type "/fast" for lite
                    </span>
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 bg-black/40 border-t border-violet-500/30">
                    <div className="relative flex items-center group">
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={useDeepThink ? "Ask complex question..." : "Enter command..."}
                            className="w-full bg-gray-900/50 text-white text-sm rounded-sm pl-4 pr-12 py-3 border border-gray-700 focus:border-violet-500 outline-none transition font-mono placeholder-gray-600"
                            disabled={isThinking}
                        />
                        <button 
                            type="submit" 
                            disabled={!inputValue.trim() || isThinking}
                            className="absolute right-2 p-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 rounded-sm text-white transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIAssistant;
