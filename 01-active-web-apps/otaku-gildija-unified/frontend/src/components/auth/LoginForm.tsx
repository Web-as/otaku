import React, { useState } from 'react';
import { Lock, User, ArrowRight, LayoutGrid, ShieldCheck, Terminal, Shield } from 'lucide-react';
import { MOCK_USERS } from '../../services/mockData';

interface LoginFormProps {
  onLogin: (username: string) => void;
  onCancel: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
        onLogin(username);
    }, 1000);
  };

  const handleQuickLogin = (user: string) => {
      setUsername(user);
      setPassword('demo123');
      setIsLoading(true);
      setTimeout(() => onLogin(user), 800);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[size:30px_30px] bg-anime-grid opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-sm shadow-2xl relative z-10 overflow-hidden group">
            {/* Tech Borders */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-violet-500"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-500"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-violet-500"></div>

            <div className="p-8">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gray-800 border border-gray-700 mb-6 shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-transparent"></div>
                        <Shield className="w-8 h-8 text-pink-400 relative z-10" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Gildijos Vartai</h2>
                    <p className="text-gray-500 mt-2 text-xs font-mono uppercase tracking-widest">Nario Identifikacija</p>
                </div>

                {/* Quick Identity Select (Demo) */}
                <div className="grid grid-cols-3 gap-2 mb-8">
                    {Object.keys(MOCK_USERS).map(u => (
                         <button 
                            key={u}
                            onClick={() => handleQuickLogin(u)}
                            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-pink-500 rounded-sm p-2 flex flex-col items-center transition group/btn"
                         >
                            <img src={MOCK_USERS[u].avatarUrl} className="w-8 h-8 rounded-full mb-1 opacity-80 group-hover/btn:opacity-100" />
                            <span className="text-[9px] font-mono text-gray-400 uppercase">{u.slice(0,8)}</span>
                         </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-2 font-mono">Slapyvardis</label>
                        <div className="relative group/input">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-sm opacity-0 group-hover/input:opacity-50 transition duration-300 blur"></div>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-black border border-gray-700 text-white rounded-sm py-3 pl-10 pr-4 focus:border-pink-500 outline-none transition font-mono text-sm placeholder-gray-700"
                                    placeholder="USER_01"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-2 font-mono">Slaptažodis</label>
                        <div className="relative group/input">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-sm opacity-0 group-hover/input:opacity-50 transition duration-300 blur"></div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black border border-gray-700 text-white rounded-sm py-3 pl-10 pr-4 focus:border-pink-500 outline-none transition font-mono text-sm placeholder-gray-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center py-4 rounded-sm font-black text-white text-sm uppercase tracking-widest transition-all ${
                            isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-lg shadow-violet-900/30'
                        }`}
                    >
                        {isLoading ? (
                            <span className="inline-flex items-center animate-pulse">
                                <Terminal className="w-4 h-4 mr-2" />
                                Jungiamasi...
                            </span>
                        ) : (
                            <span className="inline-flex items-center">
                                Prisijungti <ArrowRight className="w-4 h-4 ml-2" />
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button onClick={onCancel} className="text-xs text-gray-500 hover:text-white transition font-mono uppercase border-b border-transparent hover:border-gray-500">
                        Atšaukti Operaciją
                    </button>
                </div>
            </div>
            
            <div className="bg-black/40 p-3 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-gray-600 uppercase">
                <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> Secure TLS 1.3</span>
                <span>v2.4.0-BETA</span>
            </div>
        </div>
    </div>
  );
};

export default LoginForm;