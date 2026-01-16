
import React, { useState, useRef, useEffect } from 'react';
import { MoveHorizontal, FileVideo, Folder, PlayCircle } from 'lucide-react';

const BeforeAfterDemo: React.FC = () => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = (clientX: number) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            setSliderPosition(percentage);
        }
    };

    const onMouseDown = () => { isDragging.current = true; };
    const onMouseUp = () => { isDragging.current = false; };
    const onMouseMove = (e: React.MouseEvent) => { if (isDragging.current) handleMove(e.clientX); };
    const onTouchMove = (e: React.TouchEvent) => { handleMove(e.touches[0].clientX); };

    useEffect(() => {
        const handleGlobalMouseUp = () => { isDragging.current = false; };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    // --- MOCK CONTENT ---
    const MessyFile = ({ name }: { name: string }) => (
        <div className="flex items-center gap-2 p-2 bg-white/5 border border-white/5 rounded mb-2 opacity-60">
            <FileVideo className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-mono text-gray-400 truncate">{name}</span>
        </div>
    );

    const CleanCard = ({ title, ep, res }: { title: string, ep: string, res: string }) => (
        <div className="flex items-center gap-3 p-2 bg-gray-900/80 border border-violet-500/30 rounded mb-2 shadow-lg">
            <div className="w-8 h-10 bg-gray-800 rounded flex items-center justify-center shrink-0">
                <PlayCircle className="w-4 h-4 text-pink-500" />
            </div>
            <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{title}</div>
                <div className="flex gap-2 text-[10px] font-mono text-gray-400">
                    <span className="text-violet-400">{ep}</span>
                    <span className="bg-gray-800 px-1 rounded">{res}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto select-none">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Interactive Sort Demo</h3>
                <p className="text-xs text-gray-500 font-mono">Drag the slider to organize the folder</p>
            </div>

            <div 
                ref={containerRef}
                className="relative h-[400px] w-full bg-black rounded-lg border border-gray-800 overflow-hidden cursor-col-resize shadow-2xl"
                onMouseMove={onMouseMove}
                onMouseDown={onMouseDown}
                onTouchMove={onTouchMove}
            >
                {/* RIGHT SIDE (AFTER) */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f0e17] to-gray-900 flex flex-col p-6">
                    <div className="flex items-center gap-2 mb-6 text-green-400 font-bold uppercase text-sm">
                        <Folder className="w-5 h-5" /> Organized Library
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <CleanCard title="Attack on Titan: The Final Season" ep="Episode 88" res="1080p" />
                        <CleanCard title="Jujutsu Kaisen" ep="Episode 24" res="4K HDR" />
                        <CleanCard title="Demon Slayer: Swordsmith Village" ep="Episode 11" res="1080p" />
                        <CleanCard title="Chainsaw Man" ep="Episode 12" res="1080p" />
                        <CleanCard title="Spy x Family" ep="Episode 25" res="4K" />
                        <CleanCard title="Cyberpunk: Edgerunners" ep="Episode 10" res="2160p" />
                    </div>
                    <div className="mt-auto p-4 bg-green-900/10 border border-green-500/20 rounded text-center">
                        <span className="text-green-400 font-bold text-xs uppercase tracking-widest">Metadata Synced • 0 Errors</span>
                    </div>
                </div>

                {/* LEFT SIDE (BEFORE) - Clipped */}
                <div 
                    className="absolute inset-0 bg-gray-950 border-r border-red-500/50 flex flex-col p-6 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <div className="flex items-center gap-2 mb-6 text-red-400 font-bold uppercase text-sm min-w-max">
                        <Folder className="w-5 h-5" /> Downloads_Folder_Final_v2
                    </div>
                    <div className="space-y-2 min-w-max">
                        <MessyFile name="[HorribleSubs] AOT_S4_Final_Part3_1080p.mkv" />
                        <MessyFile name="jjk_ep24_subbed_fixed.mp4" />
                        <MessyFile name="kimetsu_no_yaiba_s3_11.mkv" />
                        <MessyFile name="csm_12_v2.mp4" />
                        <MessyFile name="VIDEO_TS_SPY_FAMILY.ISO" />
                        <MessyFile name="unknown_file_2023_10_02.avi" />
                        <MessyFile name="Cyberpunk.Edgerunners.S01E10.WEB.x264.mp4" />
                        <MessyFile name="New Folder (2)/Series/Anime/Data/file.txt" />
                    </div>
                    <div className="mt-auto p-4 bg-red-900/10 border border-red-500/20 rounded text-center min-w-max">
                        <span className="text-red-400 font-bold text-xs uppercase tracking-widest">Scan Required • 420 Files Unsorted</span>
                    </div>
                </div>

                {/* SLIDER HANDLE */}
                <div 
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-20 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                    style={{ left: `${sliderPosition}%` }}
                >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-0.5">
                        <MoveHorizontal className="w-5 h-5 text-black" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeforeAfterDemo;
