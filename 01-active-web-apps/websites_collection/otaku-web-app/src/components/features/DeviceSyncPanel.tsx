
import React, { useState, useEffect, useRef } from 'react';
import { 
    Laptop, 
    Smartphone, 
    RefreshCw, 
    Terminal, 
    X, 
    CheckCircle2, 
    AlertCircle, 
    DownloadCloud, 
    UploadCloud,
    Server,
    Database,
    Cpu,
    ShieldCheck,
    HardDrive,
    Activity
} from 'lucide-react';
import { Device, SyncLog } from '../../types/types';

interface DeviceSyncPanelProps {
    onClose: () => void;
}

const DeviceSyncPanel: React.FC<DeviceSyncPanelProps> = ({ onClose }) => {
    // Mock State for Devices
    const [devices, setDevices] = useState<Device[]>([
        { 
            id: 'd1', 
            name: 'Otaku Core (Desktop)', 
            platform: 'Windows', 
            status: 'online', 
            lastSeen: 'Live', 
            lastServerSeq: 402,
            ipAddress: '192.168.1.42',
            version: 'v2.4.0-BETA',
            currentTask: 'Idle'
        },
        { 
            id: 'd2', 
            name: 'Gildija Mobile', 
            platform: 'Android', 
            status: 'offline', 
            lastSeen: '2 hours ago', 
            lastServerSeq: 389,
            ipAddress: '10.0.0.15',
            version: 'v1.2.1',
            currentTask: 'Background'
        },
        {
            id: 'srv1',
            name: 'FastAPI Backend',
            platform: 'Server',
            status: 'online',
            lastSeen: 'Live',
            lastServerSeq: 402,
            ipAddress: 'localhost:8000',
            version: 'v1.0.0',
            currentTask: 'uvicorn worker'
        }
    ]);

    const [logs, setLogs] = useState<SyncLog[]>([
        { id: 'init', timestamp: new Date().toLocaleTimeString(), message: 'Sync Service v2.4 initialized. Postgres Pool: Active.', source: 'System', type: 'info' }
    ]);
    const [isSyncing, setIsSyncing] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Simulate Real-time "Correspondence"
    useEffect(() => {
        const interval = setInterval(() => {
            const randomEvent = Math.random();
            const timestamp = new Date().toLocaleTimeString();
            
            // Simulation Logic
            if (randomEvent > 0.6) {
                let newLog: SyncLog | null = null;
                
                // Desktop / Autosorter Activity (FastAPI Calls)
                if (randomEvent > 0.6 && randomEvent < 0.8) {
                    const tasks = [
                        { msg: 'POST /api/v1/sync/checkpoint', details: 'Payload: 2.4KB, Seq: 403' },
                        { msg: 'DB: INSERT INTO watch_entries', details: 'Hash: a1b2... Duration: 1420s' },
                        { msg: 'Auth: Bearer Token Validated', details: 'User: DevAdmin' },
                        { msg: 'Worker: Generating Thumbnails', details: 'Queue: 3 items' },
                        { msg: 'DB: SELECT * FROM devices', details: 'Latency: 2ms' },
                        { msg: 'Oplog: Appending XPEvent', details: 'Type: organized_file (+10 XP)' },
                        { msg: 'FastAPI: 200 OK', details: 'Response Time: 45ms' }
                    ];
                    const task = tasks[Math.floor(Math.random() * tasks.length)];
                    
                    newLog = {
                        id: Date.now().toString(),
                        timestamp,
                        message: task.msg,
                        source: task.msg.includes('DB') ? 'Postgres' : 'FastAPI',
                        type: 'info',
                        details: task.details
                    };

                    setDevices(prev => prev.map(d => d.platform === 'Windows' ? { ...d, currentTask: 'Syncing w/ API' } : d));
                    setTimeout(() => {
                         setDevices(prev => prev.map(d => d.platform === 'Windows' ? { ...d, currentTask: 'Idle' } : d));
                    }, 600);
                } 
                // Android Activity (Oplog Catchup)
                else if (randomEvent >= 0.8) {
                    // Occasionally verify sync status
                    if (devices.find(d => d.platform === 'Android')?.status === 'online') {
                         const tasks = [
                            { msg: 'GET /api/v1/sync/checkpoint', details: 'LastSeq: 389' },
                            { msg: 'DB: SELECT FROM xp_events', details: 'Replaying 12 events...' },
                            { msg: 'Cache: Invalidate UserProfile', details: 'Reason: New Badge' }
                        ];
                        const task = tasks[Math.floor(Math.random() * tasks.length)];
                        
                        newLog = {
                            id: Date.now().toString(),
                            timestamp,
                            message: task.msg,
                            source: 'Android',
                            type: 'success',
                            details: task.details
                        };
                    }
                }

                if (newLog) {
                    setLogs(prev => [...prev.slice(-49), newLog!]);
                }
            }
        }, 1200);

        return () => clearInterval(interval);
    }, [devices]);

    const handleForceSync = () => {
        setIsSyncing(true);
        const timestamp = new Date().toLocaleTimeString();
        
        setLogs(prev => [...prev, { 
            id: Date.now().toString(), 
            timestamp, 
            message: 'INIT: GLOBAL_CHECKPOINT_SYNC', 
            source: 'System', 
            type: 'warning',
            details: 'Force sync requested by admin'
        }]);

        setDevices(prev => prev.map(d => d.status === 'online' ? { ...d, status: 'syncing', currentTask: 'Negotiating Seq...' } : d));

        // Simulate Oplog Sync Steps
        setTimeout(() => {
             setLogs(prev => [...prev, { 
                id: Date.now().toString(), 
                timestamp: new Date().toLocaleTimeString(), 
                message: 'FastAPI: Locking server_seq...', 
                source: 'FastAPI', 
                type: 'info' 
            }]);
        }, 800);

        setTimeout(() => {
             setLogs(prev => [...prev, { 
                id: Date.now().toString(), 
                timestamp: new Date().toLocaleTimeString(), 
                message: 'Postgres: COMMIT transaction', 
                source: 'Postgres', 
                type: 'success',
                details: 'Applied 4 changes to watch_entries' 
            }]);
        }, 1600);

        setTimeout(() => {
             setLogs(prev => [...prev, { 
                id: Date.now().toString(), 
                timestamp: new Date().toLocaleTimeString(), 
                message: 'Android: Ack checkpoint', 
                source: 'Android', 
                type: 'info',
                details: 'Updated to Seq 403'
            }]);
        }, 2400);

        setTimeout(() => {
            setIsSyncing(false);
            setDevices(prev => prev.map(d => d.status === 'syncing' ? { ...d, status: 'online', lastServerSeq: 403, currentTask: 'Idle' } : d));
            setLogs(prev => [...prev, { 
                id: Date.now().toString(), 
                timestamp: new Date().toLocaleTimeString(), 
                message: 'SYNC_COMPLETE: All nodes consistent (Seq 403).', 
                source: 'System', 
                type: 'success' 
            }]);
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-200">
            <div className="bg-gray-900 w-full md:max-w-6xl md:rounded-xl shadow-2xl border-none md:border border-gray-700 overflow-hidden flex flex-col lg:flex-row h-full md:h-[80vh] md:max-h-[800px]">
                
                {/* Header for Mobile (Sticky) */}
                <div className="flex justify-between items-center px-4 py-3 bg-[#111] border-b border-gray-800 lg:hidden shrink-0">
                    <div className="flex items-center space-x-2">
                        <Terminal className="w-5 h-5 text-violet-400" />
                        <span className="text-sm font-bold text-gray-200">Backend Control</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Left Panel: Infrastructure Topology */}
                <div className="w-full lg:w-1/3 bg-gray-800/30 border-b lg:border-b-0 lg:border-r border-gray-700 p-4 md:p-6 flex flex-col relative overflow-hidden shrink-0">
                    {/* Background Grid Decoration */}
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4 md:mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                                <Server className="w-5 h-5 md:w-6 md:h-6 mr-3 text-violet-500" /> 
                                Infrastructure
                            </h2>
                            <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs text-green-500 font-mono">POSTGRES HEALTHY</span>
                            </div>
                        </div>

                        <div className="space-y-3 md:space-y-4">
                            {devices.map(device => (
                                <div key={device.id} className={`relative p-3 md:p-4 rounded-lg border transition-all duration-300 ${device.status === 'online' || device.status === 'syncing' ? 'bg-violet-900/10 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]' : 'bg-gray-800/50 border-gray-700 opacity-60'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-1.5 md:p-2 rounded-lg ${
                                                device.platform === 'Windows' ? 'bg-blue-500/10 text-blue-400' : 
                                                device.platform === 'Server' ? 'bg-orange-500/10 text-orange-400' :
                                                'bg-green-500/10 text-green-400'
                                            }`}>
                                                {device.platform === 'Windows' ? <Laptop className="w-4 h-4 md:w-5 md:h-5" /> : 
                                                 device.platform === 'Server' ? <Database className="w-4 h-4 md:w-5 md:h-5" /> :
                                                 <Smartphone className="w-4 h-4 md:w-5 md:h-5" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm md:text-base">{device.name}</h3>
                                                <p className="text-[10px] md:text-xs text-gray-500 font-mono">{device.ipAddress}</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                            device.status === 'online' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            device.status === 'syncing' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                            {device.status}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-2 pt-2 border-t border-gray-700/50">
                                        <div className="flex justify-between items-center text-[10px] font-mono">
                                            <span className="text-gray-400">Server Seq: {device.lastServerSeq}</span>
                                            <span className={`font-mono ${device.currentTask === 'Idle' ? 'text-gray-500' : 'text-violet-300 animate-pulse'}`}>
                                                {device.currentTask || 'Idle'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 md:mt-auto relative z-10">
                        <button 
                            onClick={handleForceSync}
                            disabled={isSyncing}
                            className={`w-full py-3 md:py-4 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center transition-all border ${
                                isSyncing ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] text-white'
                            }`}
                        >
                            {isSyncing ? (
                                <>
                                    <RefreshCw className="w-4 h-4 md:w-5 md:h-5 mr-3 animate-spin" /> 
                                    <span>PROCESSING OPLOG...</span>
                                </>
                            ) : (
                                <>
                                    <Database className="w-4 h-4 md:w-5 md:h-5 mr-3" /> 
                                    <span>TRIGGER CHECKPOINT SYNC</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Terminal / Logs */}
                <div className="w-full lg:w-2/3 bg-[#0c0c0c] flex flex-col font-mono relative">
                    {/* Header (Desktop Only) */}
                    <div className="hidden lg:flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-[#111]">
                        <div className="flex items-center space-x-4">
                            <Terminal className="w-5 h-5 text-gray-400" />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-200">AsyncPG Protocol Stream</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest">TLS 1.3 • Port 8000 • Pool Size: 20</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-1">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                            <button onClick={onClose} className="ml-4 text-gray-500 hover:text-white transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Terminal Window */}
                    <div className="flex-grow p-4 md:p-6 overflow-y-auto space-y-3 text-[10px] sm:text-xs md:text-sm font-mono bg-black/50 custom-scrollbar h-64 lg:h-auto">
                        {logs.map(log => (
                            <div key={log.id} className="group flex items-start hover:bg-white/5 p-1 rounded -mx-1 transition-colors">
                                <span className="text-gray-600 w-16 md:w-24 shrink-0 select-none hidden sm:inline">[{log.timestamp}]</span>
                                
                                <span className={`w-16 md:w-24 shrink-0 font-bold uppercase tracking-wider text-[9px] md:text-[10px] py-0.5 px-1 rounded text-center mr-2 md:mr-3 select-none ${
                                    log.source === 'Postgres' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
                                    log.source === 'FastAPI' ? 'bg-green-900/30 text-green-400 border border-green-900/50' :
                                    'bg-purple-900/30 text-purple-400 border border-purple-900/50'
                                }`}>
                                    {log.source}
                                </span>

                                <div className="flex-grow break-all">
                                    <span className={`${
                                        log.type === 'error' ? 'text-red-400' :
                                        log.type === 'success' ? 'text-green-400' :
                                        log.type === 'warning' ? 'text-yellow-400' :
                                        'text-gray-300'
                                    }`}>
                                        {log.type === 'success' && <CheckCircle2 className="w-3 h-3 inline mr-2 -mt-0.5" />}
                                        {log.type === 'error' && <AlertCircle className="w-3 h-3 inline mr-2 -mt-0.5" />}
                                        {log.message}
                                    </span>
                                    {log.details && (
                                        <div className="text-gray-500 mt-1 pl-4 border-l-2 border-gray-800 text-[9px] md:text-[10px] font-light opacity-80">
                                            {log.details}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={logsEndRef} className="h-4" />
                    </div>

                    {/* Data Flow Visualizer Footer */}
                    <div className="p-2 md:p-4 border-t border-gray-800 bg-[#111] grid grid-cols-3 gap-2 md:gap-4 shrink-0">
                        <div className="flex flex-col justify-center items-center p-2 bg-black/40 rounded border border-gray-800">
                            <span className="text-[9px] md:text-[10px] text-gray-500 uppercase mb-1 hidden sm:inline">Transaction Rate</span>
                            <span className="text-[9px] text-gray-500 uppercase mb-1 sm:hidden">TX/s</span>
                            <div className="flex items-center space-x-2">
                                <Database className={`w-4 h-4 ${isSyncing ? 'text-blue-400 animate-pulse' : 'text-gray-600'}`} />
                                <span className="text-xs font-mono text-gray-300 hidden sm:inline">{isSyncing ? '420 TPS' : '12 TPS'}</span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center p-2 bg-black/40 rounded border border-gray-800">
                            <span className="text-[9px] md:text-[10px] text-gray-500 uppercase mb-1 hidden sm:inline">API Latency</span>
                            <span className="text-[9px] text-gray-500 uppercase mb-1 sm:hidden">PING</span>
                            <div className="flex items-center space-x-2">
                                <Activity className={`w-4 h-4 ${isSyncing ? 'text-green-400' : 'text-gray-600'}`} />
                                <span className="text-xs font-mono text-gray-300 hidden sm:inline">24ms</span>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center p-2 bg-black/40 rounded border border-gray-800">
                            <span className="text-[9px] md:text-[10px] text-gray-500 uppercase mb-1 hidden sm:inline">Security</span>
                            <span className="text-[9px] text-gray-500 uppercase mb-1 sm:hidden">SEC</span>
                            <div className="flex items-center space-x-2">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-mono text-gray-300 hidden sm:inline">JWT/HS256</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1a1a1a; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333; 
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555; 
                }
            `}</style>
        </div>
    );
};

export default DeviceSyncPanel;