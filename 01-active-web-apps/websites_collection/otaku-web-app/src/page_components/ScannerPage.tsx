import { useState, useEffect } from 'react';
import { FolderOpen, Search, CheckCircle, AlertCircle, Loader2, FileVideo, Skull, Sword, ShieldAlert, Sparkles, Coins } from 'lucide-react';
import { scannerAPI, organizerAPI } from '../services/api';

interface ScanResult {
  id: string;
  title: string;
  path: string;
  type: string;
  episodes: number;
}

const ScannerPage = () => {
  const [scanPath, setScanPath] = useState('');
  const [scanning, setScanning] = useState(false);
  const [organizing, setOrganizing] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Gamification state
  const [dungeonDepth, setDungeonDepth] = useState(0);
  const [monstersDefeated, setMonstersDefeated] = useState(0);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  const handleScan = async () => {
    if (!scanPath.trim()) {
      setError('Enter coordinates to initiate raid.');
      return;
    }

    try {
      setScanning(true);
      setError(null);
      setSuccess(null);
      setDungeonDepth(10);
      
      const response = await scannerAPI.scan(scanPath);
      setResults(response.data.results || []);
      setSuccess(`Dungeon Scanned. Found ${response.data.results?.length || 0} Corrupted Files.`);
      setDungeonDepth(50);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Raid failed. Path inaccessible.');
      setResults([]);
      setDungeonDepth(0);
    } finally {
      setScanning(false);
    }
  };

  const handleOrganize = async () => {
    if (results.length === 0) {
      setError('No enemies found.');
      return;
    }

    if (!confirm(`Initiate attack sequence on ${results.length} corrupted files?`)) {
      return;
    }

    try {
      setOrganizing(true);
      setError(null);
      setMonstersDefeated(0);
      
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
      const wsUrl = apiBase.replace('http', 'ws') + '/api/v1/scanner/ws/scan';
        
      const ws = new WebSocket(wsUrl);
      setWsConnection(ws);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.event === 'enemy_defeated') {
            setMonstersDefeated(prev => prev + 1);
            setDungeonDepth(prev => Math.min(100, prev + 5));
        } else if (data.event === 'raid_complete') {
            setSuccess(`Raid Successful! Purified all files.`);
            setResults([]);
            setScanPath('');
            setDungeonDepth(100);
            setOrganizing(false);
            ws.close();
        }
      };
      
      ws.onerror = (error) => {
         setError('Raid Connection Terminated.');
         setOrganizing(false);
      };
    } catch (err: any) {
      setError(err.message || 'Attack sequence interrupted.');
      setOrganizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white p-8 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-[#0f0e17] to-[#0f0e17] pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header RPG Style */}
        <div className="mb-12 flex items-center justify-between border-b border-red-900/30 pb-6">
          <div className="flex items-center space-x-4">
             <div className="p-4 bg-red-950/50 border border-red-500/30 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                <Skull className="w-8 h-8 text-red-500" />
             </div>
             <div>
                <h1 className="text-4xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 uppercase tracking-tight">
                  Dungeon Scanner Raid
                </h1>
                <p className="text-red-400/70 font-mono text-sm uppercase tracking-widest">Identify & Purify Corrupted Files</p>
             </div>
          </div>
          
          <div className="hidden sm:flex flex-col items-end">
             <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Dungeon Depth</span>
             <div className="w-48 h-3 bg-gray-900 rounded-full border border-gray-800 overflow-hidden relative">
                <div 
                   className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-1000 ease-out relative"
                   style={{ width: `${dungeonDepth}%` }}
                >
                   <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                </div>
             </div>
             <span className="text-red-400 font-mono text-xs mt-1">{Math.floor(dungeonDepth)}%</span>
          </div>
        </div>

        {/* Scanner Input / Command Module */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-red-900/50 rounded-xl p-8 mb-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <label className="block text-sm font-bold text-red-400/80 mb-4 uppercase tracking-widest flex items-center">
            <Search className="w-4 h-4 mr-2" /> Enter Target Coordinates
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={scanPath}
                onChange={(e) => setScanPath(e.target.value)}
                placeholder="C:\Anime\Downloads (The Void)"
                className="w-full bg-black/50 border border-gray-800 text-red-100 font-mono pl-12 pr-4 py-4 rounded-lg focus:border-red-500 outline-none transition"
                disabled={scanning || organizing}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={scanning || organizing || !scanPath.trim()}
              className="px-8 py-4 bg-red-900/40 border border-red-500 hover:bg-red-900/60 text-red-100 font-bold uppercase tracking-widest rounded-lg transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]"
            >
              {scanning ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Scanning...</>
              ) : (
                <><Search className="w-5 h-5 mr-2" /> Scout Area</>
              )}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-950/50 border-l-4 border-red-500 text-red-400 px-6 py-4 rounded mb-6 flex items-center shadow-lg font-mono text-sm">
            <ShieldAlert className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>CRITICAL: {error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-950/50 border-l-4 border-green-500 text-green-400 px-6 py-4 rounded mb-6 flex items-center shadow-lg font-mono text-sm animate-in fade-in slide-in-from-bottom-4">
            <Sparkles className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>VICTORY: {success}</span>
          </div>
        )}

        {/* Results / The Battlefield */}
        {results.length > 0 && (
          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/50">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center">
                   <Sword className="w-5 h-5 mr-2 text-red-500" /> Enemy Forces Detected
                </h2>
                <p className="text-gray-400 text-sm mt-1 font-mono">
                   {results.length} corrupted entities awaiting purification. {monstersDefeated > 0 && <span className="text-green-500 ml-2">({monstersDefeated} Defeated)</span>}
                </p>
              </div>
              <button
                onClick={handleOrganize}
                disabled={organizing}
                className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black uppercase tracking-widest rounded transition flex items-center justify-center disabled:opacity-50 shadow-[0_0_20px_rgba(234,88,12,0.4)]"
              >
                {organizing ? (
                  <><Sword className="w-5 h-5 mr-2 animate-bounce" /> Attacking...</>
                ) : (
                  <><Sword className="w-5 h-5 mr-2" /> Initiate Attack</>
                )}
              </button>
            </div>

            <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto bg-black/20 p-4 space-y-2">
              {results.map((result, index) => {
                 const isDefeated = index < monstersDefeated;
                 return (
                <div key={result.id} className={`p-4 rounded-lg border transition-all duration-500 ${isDefeated ? 'bg-green-900/20 border-green-500/30 opacity-50' : 'bg-gray-900/80 border-red-900/30 hover:border-red-500/50'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${isDefeated ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {isDefeated ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Skull className="w-6 h-6 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold mb-1 truncate ${isDefeated ? 'text-gray-500 line-through' : 'text-white'}`}>{result.title}</h3>
                      <p className="text-xs text-gray-500 font-mono truncate mb-2">{result.path}</p>
                      <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-wider">
                        <span className={`px-2 py-0.5 rounded ${isDefeated ? 'bg-green-900/50 text-green-500' : 'bg-red-900/50 text-red-400'}`}>Type: {result.type}</span>
                        {result.episodes > 0 && <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded">HP: {result.episodes}</span>}
                      </div>
                    </div>
                    {isDefeated && (
                       <div className="flex items-center text-yellow-500 animate-in fade-in slide-in-from-bottom-2">
                          <Coins className="w-4 h-4 mr-1" />
                          <span className="font-bold font-mono text-sm">+50</span>
                       </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!scanning && results.length === 0 && !error && !success && (
          <div className="text-center py-20 bg-gray-900/20 border border-gray-800 border-dashed rounded-xl mt-8">
            <ShieldAlert className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-500 uppercase tracking-widest mb-2">Area Secure</h3>
            <p className="text-gray-600 font-mono text-sm">No corrupted files detected in current sector.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;
