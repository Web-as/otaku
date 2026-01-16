
import React, { useState } from 'react';
import { Users, Copy, Check, Gift, Shield } from 'lucide-react';

const ReferralSystem: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const referralLink = "https://otakunexus.lt/ref/GUILD-MEMBER-42";

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-gradient-to-r from-violet-900/20 to-pink-900/20 border border-violet-500/30 rounded-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Users className="w-32 h-32 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">Guild Recruitment</h3>
                <p className="text-gray-400 text-sm max-w-md mb-6">
                    Invite other Otakus to organize their libraries. Earn unique badges and Gacha currency for every recruit who buys the Founder's Pack.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                    <div className="flex-grow bg-black/50 border border-gray-700 rounded px-4 py-3 flex items-center justify-between">
                        <span className="text-gray-300 font-mono text-xs">{referralLink}</span>
                        <button onClick={handleCopy} className="text-gray-500 hover:text-white transition ml-2">
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-4 rounded text-center">
                    <div className="text-2xl font-black text-white mb-1">0</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recruits</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 rounded text-center">
                    <div className="text-2xl font-black text-yellow-500 mb-1">0</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Coins Earned</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 rounded text-center opacity-50">
                    <div className="flex justify-center mb-1">
                        <Shield className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recruiter Badge (Locked)</div>
                </div>
            </div>

            <div className="bg-gray-900/50 p-4 rounded border border-gray-800">
                <h4 className="text-xs font-bold text-white uppercase mb-3 flex items-center">
                    <Gift className="w-3 h-3 mr-2 text-pink-500" /> Rewards
                </h4>
                <ul className="space-y-2 text-xs text-gray-400">
                    <li className="flex justify-between">
                        <span>1 Recruit</span>
                        <span className="text-yellow-500 font-mono">+100 Coins</span>
                    </li>
                    <li className="flex justify-between">
                        <span>5 Recruits</span>
                        <span className="text-violet-400 font-mono">Recruiter Badge + 500 Coins</span>
                    </li>
                    <li className="flex justify-between">
                        <span>10 Recruits</span>
                        <span className="text-pink-400 font-mono">Unique Profile Theme</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ReferralSystem;
