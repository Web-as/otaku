
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar, Save, AlertCircle, Shield, Radio, Headphones, Server, MessageSquare } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebase';
import { useLanguage } from '../../services/i18n';
import LoadingSpinner from '../LoadingSpinner';

const ROLES = [
    {
        id: 'mods',
        title: "Guild Moderators",
        icon: <Shield className="w-4 h-4" />,
        color: "from-indigo-900/50 to-indigo-800/30 border-indigo-500/30",
        shifts: [
            { id: 'alpha', label: 'Morning (JP)', time: '00:00 - 06:00', color: 'text-indigo-300' },
            { id: 'beta', label: 'Day (EU)', time: '06:00 - 12:00', color: 'text-indigo-300' },
            { id: 'gamma', label: 'Evening (US)', time: '12:00 - 18:00', color: 'text-indigo-300' },
            { id: 'delta', label: 'Night (OC)', time: '18:00 - 00:00', color: 'text-indigo-300' },
        ]
    },
    {
        id: 'uploaders',
        title: "Content Uploaders",
        icon: <Server className="w-4 h-4" />,
        color: "from-emerald-900/50 to-emerald-800/30 border-emerald-500/30",
        shifts: [
            { id: 'alpha', label: 'Morning', time: '00:00 - 06:00', color: 'text-emerald-300' },
            { id: 'beta', label: 'Day', time: '06:00 - 12:00', color: 'text-emerald-300' },
            { id: 'gamma', label: 'Evening', time: '12:00 - 18:00', color: 'text-emerald-300' },
            { id: 'delta', label: 'Night', time: '18:00 - 00:00', color: 'text-emerald-300' },
        ]
    },
    {
        id: 'events',
        title: "Event Hosts",
        icon: <Radio className="w-4 h-4" />,
        color: "from-pink-900/50 to-pink-800/30 border-pink-500/30",
        shifts: [
            { id: 'alpha', label: 'Slot A', time: '00:00 - 06:00', color: 'text-pink-300' },
            { id: 'beta', label: 'Slot B', time: '06:00 - 12:00', color: 'text-pink-300' },
            { id: 'gamma', label: 'Slot C', time: '12:00 - 18:00', color: 'text-pink-300' },
            { id: 'delta', label: 'Slot D', time: '18:00 - 00:00', color: 'text-pink-300' },
        ]
    }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const GuildSchedule: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [utcTime, setUtcTime] = useState('');
    const [scheduleData, setScheduleData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [activeCell, setActiveCell] = useState<string | null>(null);
    const { t } = useLanguage();

    // Clock Logic
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setUtcTime(now.toUTCString().match(/(\d{2}:\d{2}:\d{2})/)?.[0] || '');
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Week ID Helper
    const getWeekId = (date: Date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    };

    const currentWeekId = getWeekId(currentDate);

    // Data Sync
    useEffect(() => {
        if (!db) return;
        setLoading(true);
        const docRef = doc(db, "artifacts", appId, "public/data/rotas", currentWeekId);
        
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setScheduleData(snap.data() as Record<string, string>);
            } else {
                setScheduleData({});
            }
            setLoading(false);
        }, (err) => {
            console.error("Rota sync error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentWeekId]);

    const handleSave = async (cellId: string, value: string) => {
        if (!db) return;
        const docRef = doc(db, "artifacts", appId, "public/data/rotas", currentWeekId);
        try {
            await setDoc(docRef, { [cellId]: value }, { merge: true });
        } catch (e) {
            console.error("Failed to save shift:", e);
        }
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentDate(newDate);
    };

    // Helper to render date in header
    const getDayDate = (dayIndex: number) => {
        const d = new Date(currentDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) + dayIndex;
        const target = new Date(d.setDate(diff));
        return target.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigateWeek('prev')} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest">{currentWeekId}</h3>
                        <div className="flex items-center justify-center text-xs text-gray-500 font-mono">
                            <Calendar className="w-3 h-3 mr-1" />
                            Global Schedule
                        </div>
                    </div>
                    <button onClick={() => navigateWeek('next')} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center px-4 py-2 bg-black/40 rounded border border-gray-700">
                    <Clock className="w-4 h-4 text-green-500 mr-2 animate-pulse" />
                    <span className="text-xl font-mono font-bold text-green-400">{utcTime || '--:--:--'}</span>
                    <span className="ml-2 text-[10px] font-bold text-gray-600 uppercase">UTC</span>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900 shadow-2xl">
                {loading ? (
                    <div className="p-12">
                        <LoadingSpinner text="Syncing Schedule..." />
                    </div>
                ) : (
                    <table className="w-full min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="bg-gray-950">
                                <th className="p-4 text-left border-b border-r border-gray-800 w-48 sticky left-0 bg-gray-950 z-10">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Role / Shift</span>
                                </th>
                                {DAYS.map((day, i) => (
                                    <th key={day} className="p-4 text-left border-b border-gray-800 min-w-[140px]">
                                        <div className="text-sm font-bold text-white uppercase">{day.slice(0, 3)}</div>
                                        <div className="text-[10px] font-mono text-gray-600">{getDayDate(i)}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {ROLES.map(role => (
                                <React.Fragment key={role.id}>
                                    {/* Role Header Row (Optional, or just styling) */}
                                    <tr className="bg-gray-900/30">
                                        <td colSpan={8} className="p-2 border-r border-gray-800 sticky left-0 bg-gray-900 z-10">
                                            <div className="flex items-center px-2">
                                                <div className={`p-1.5 rounded mr-2 bg-gradient-to-br ${role.color} border`}>
                                                    {role.icon}
                                                </div>
                                                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{role.title}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    {/* Shift Rows */}
                                    {role.shifts.map(shift => (
                                        <tr key={shift.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 border-r border-gray-800 sticky left-0 bg-gray-900 group z-10">
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold ${shift.color}`}>{shift.label}</span>
                                                    <span className="text-[9px] font-mono text-gray-600">{shift.time} UTC</span>
                                                </div>
                                            </td>
                                            {DAYS.map((day, dayIndex) => {
                                                const cellId = `${role.id}-${shift.id}-${dayIndex}`;
                                                const value = scheduleData[cellId] || '';
                                                
                                                return (
                                                    <td key={dayIndex} className="border-l border-gray-800/50 p-1 relative">
                                                        <input
                                                            type="text"
                                                            defaultValue={value}
                                                            onBlur={(e) => handleSave(cellId, e.target.value)}
                                                            placeholder="Open Slot"
                                                            className={`w-full h-full bg-transparent p-2 text-xs font-medium text-gray-300 placeholder-gray-700/50 focus:bg-white/5 focus:text-white outline-none rounded transition-colors ${value ? 'text-white' : ''}`}
                                                        />
                                                        {value && (
                                                            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-500/50 pointer-events-none"></div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase">
                <div className="flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Changes save automatically
                </div>
                <div>
                    Sync Protocol: Firebase Firestore Live
                </div>
            </div>
        </div>
    );
};

export default GuildSchedule;
