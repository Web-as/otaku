import React, { useState } from 'react';
import { CheckCircle2, Clock, Coins, Star, Trophy } from 'lucide-react';
import { Quest } from '../../types/types';

interface QuestBoardProps {
    quests: Quest[];
    onClaim: (questId: string) => void;
}

const QuestBoard: React.FC<QuestBoardProps> = ({ quests, onClaim }) => {
    const [timeLeft] = useState("12:34:56"); // Simulated time left

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                    <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                    Aktyvios Misijos
                </h3>
                <span className="text-xs font-mono text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> Reset: {timeLeft}
                </span>
            </div>

            <div className="grid gap-3">
                {quests.map(quest => (
                    <div 
                        key={quest.id} 
                        className={`p-4 rounded-sm border transition-all relative overflow-hidden group ${
                            quest.isClaimed 
                                ? 'bg-gray-900/30 border-gray-800 opacity-60' 
                                : quest.isCompleted 
                                    ? 'bg-gradient-to-r from-gray-900 to-gray-800 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                                    : 'bg-gray-900 border-gray-700'
                        }`}
                    >
                        {/* Background Progress Bar */}
                        <div className="absolute bottom-0 left-0 h-1 bg-gray-800 w-full z-0">
                            <div 
                                className={`h-full transition-all duration-1000 ${quest.isCompleted ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                            ></div>
                        </div>

                        <div className="relative z-10 flex justify-between items-center">
                            <div className="flex-grow">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm ${
                                        quest.type === 'Daily' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'
                                    }`}>
                                        {quest.type}
                                    </span>
                                    <h4 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">{quest.title}</h4>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">{quest.description}</p>
                                <div className="flex items-center space-x-3 text-[10px] font-mono font-bold text-gray-500">
                                    <span className="flex items-center text-yellow-500"><Coins className="w-3 h-3 mr-1" /> +{quest.rewardCoins}</span>
                                    <span className="flex items-center text-violet-400"><Star className="w-3 h-3 mr-1" /> +{quest.rewardXp} XP</span>
                                </div>
                            </div>

                            <div className="ml-4 flex flex-col items-end min-w-[80px]">
                                <span className="text-xs font-mono font-bold text-gray-400 mb-2">
                                    {quest.progress}/{quest.maxProgress}
                                </span>
                                {quest.isClaimed ? (
                                    <button disabled className="px-3 py-1.5 bg-gray-800 text-gray-500 text-[10px] font-bold uppercase rounded-sm border border-gray-700 cursor-not-allowed">
                                        Paimta
                                    </button>
                                ) : quest.isCompleted ? (
                                    <button 
                                        onClick={() => onClaim(quest.id)}
                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold uppercase rounded-sm shadow-lg shadow-green-900/50 animate-pulse"
                                    >
                                        Atsiimti
                                    </button>
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-700 border-t-yellow-500 animate-spin opacity-20"></div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestBoard;