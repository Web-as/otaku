import React, { useState } from 'react';
import { Video, Image as ImageIcon, Eye, Upload, Sparkles, Loader, PlayCircle, Film, Camera, CheckCircle2 } from 'lucide-react';
import { ArtAgent, VideoAgent, AnalystAgent } from '../../services/aiAgent';
import LoadingSpinner from '../LoadingSpinner';
import { useLanguage } from '../../services/i18n';

const CreativeStudio: React.FC = () => {
    const [activeTool, setActiveTool] = useState<'Art' | 'Video' | 'Analyze'>('Art');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const { t } = useLanguage();
    
    // Inputs
    const [prompt, setPrompt] = useState('');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setUploadedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const executeTool = async () => {
        setLoading(true);
        setResult(null);
        try {
            if (activeTool === 'Art') {
                if (!prompt) return;
                const url = await ArtAgent.generateImage(prompt, imageSize);
                setResult(url);
            } else if (activeTool === 'Video') {
                if (!uploadedImage) return;
                const videoUrl = await VideoAgent.animateImage(uploadedImage, prompt || undefined, aspectRatio);
                setResult(videoUrl);
            } else if (activeTool === 'Analyze') {
                if (!uploadedImage) return;
                const text = await AnalystAgent.analyzeImage(uploadedImage, prompt);
                setResult(text);
            }
        } catch (e) {
            alert("Agent failed to execute task. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto min-h-screen p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">{t.studio.title}</span>
                </h1>
                <p className="text-gray-500 text-sm font-mono mt-1 uppercase tracking-widest">{t.studio.subtitle}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    <button 
                        onClick={() => { setActiveTool('Art'); setResult(null); }}
                        className={`w-full text-left p-4 rounded-lg border transition-all flex items-center ${activeTool === 'Art' ? 'bg-violet-900/30 border-violet-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'}`}
                    >
                        <ImageIcon className="w-5 h-5 mr-3 text-pink-500" />
                        <div>
                            <div className="font-bold uppercase text-sm">{t.studio.tool_art}</div>
                            <div className="text-[10px] font-mono">Image Generation</div>
                        </div>
                    </button>
                    <button 
                        onClick={() => { setActiveTool('Video'); setResult(null); }}
                        className={`w-full text-left p-4 rounded-lg border transition-all flex items-center ${activeTool === 'Video' ? 'bg-violet-900/30 border-violet-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'}`}
                    >
                        <Film className="w-5 h-5 mr-3 text-blue-500" />
                        <div>
                            <div className="font-bold uppercase text-sm">{t.studio.tool_video}</div>
                            <div className="text-[10px] font-mono">Image to Video</div>
                        </div>
                    </button>
                    <button 
                        onClick={() => { setActiveTool('Analyze'); setResult(null); }}
                        className={`w-full text-left p-4 rounded-lg border transition-all flex items-center ${activeTool === 'Analyze' ? 'bg-violet-900/30 border-violet-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'}`}
                    >
                        <Eye className="w-5 h-5 mr-3 text-green-500" />
                        <div>
                            <div className="font-bold uppercase text-sm">{t.studio.tool_scan}</div>
                            <div className="text-[10px] font-mono">Visual Analysis</div>
                        </div>
                    </button>
                </div>

                {/* Workspace */}
                <div className="lg:col-span-9 bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[size:30px_30px] bg-anime-grid opacity-5 pointer-events-none"></div>
                    
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <div className="mb-6 flex items-center space-x-3">
                            {activeTool === 'Art' && <Sparkles className="w-6 h-6 text-pink-500" />}
                            {activeTool === 'Video' && <Video className="w-6 h-6 text-blue-500" />}
                            {activeTool === 'Analyze' && <Camera className="w-6 h-6 text-green-500" />}
                            <h2 className="text-xl font-bold text-white uppercase">
                                {activeTool === 'Art' ? 'Art Forge' : activeTool === 'Video' ? 'Holodeck Animator' : 'Data Scanner'}
                            </h2>
                        </div>

                        {/* Controls */}
                        <div className="space-y-6">
                            {(activeTool === 'Video' || activeTool === 'Analyze') && (
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Source Image</label>
                                    <div className="flex items-center space-x-4">
                                        <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded border border-gray-700 flex items-center transition">
                                            <Upload className="w-4 h-4 mr-2" />
                                            {uploadedImage ? 'Change Image' : 'Upload Image'}
                                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                        </label>
                                        {uploadedImage && <img src={uploadedImage} alt="Preview" className="h-12 w-12 rounded object-cover border border-gray-600" />}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    {activeTool === 'Art' ? 'Prompt' : activeTool === 'Video' ? 'Animation Prompt (Optional)' : 'Question / Prompt'}
                                </label>
                                <textarea 
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={activeTool === 'Art' ? "A cyberpunk samurai..." : activeTool === 'Video' ? "Make the water flow..." : "Describe this character..."}
                                    className="w-full bg-black border border-gray-700 rounded p-3 text-sm text-white focus:border-violet-500 outline-none h-24 font-mono"
                                />
                            </div>

                            {/* Configs */}
                            <div className="flex gap-4">
                                {activeTool === 'Art' && (
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Resolution</label>
                                        <select 
                                            value={imageSize} 
                                            onChange={(e) => setImageSize(e.target.value as any)}
                                            className="bg-gray-800 border border-gray-700 text-white text-xs rounded p-2 outline-none"
                                        >
                                            <option value="1K">1K (Standard)</option>
                                            <option value="2K">2K (High)</option>
                                            <option value="4K">4K (Ultra)</option>
                                        </select>
                                    </div>
                                )}
                                {activeTool === 'Video' && (
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Aspect Ratio</label>
                                        <select 
                                            value={aspectRatio} 
                                            onChange={(e) => setAspectRatio(e.target.value as any)}
                                            className="bg-gray-800 border border-gray-700 text-white text-xs rounded p-2 outline-none"
                                        >
                                            <option value="16:9">Landscape (16:9)</option>
                                            <option value="9:16">Portrait (9:16)</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={executeTool}
                                disabled={loading}
                                className={`w-full py-4 rounded-sm font-black text-sm uppercase tracking-widest transition-all ${loading ? 'bg-gray-800 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-pink-600 hover:shadow-lg hover:shadow-violet-900/50 text-white'}`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <Loader className="w-4 h-4 mr-2 animate-spin" /> Processing...
                                    </span>
                                ) : (
                                    <span>{t.studio.execute}</span>
                                )}
                            </button>
                        </div>

                        {/* Results */}
                        {result && (
                            <div className="mt-8 border-t border-gray-800 pt-8 animate-in fade-in slide-in-from-bottom-2">
                                <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Output Generated
                                </h3>
                                
                                {activeTool === 'Analyze' ? (
                                    <div className="bg-black p-4 rounded border border-gray-700 font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {result}
                                    </div>
                                ) : activeTool === 'Video' ? (
                                    <div className="aspect-video bg-black rounded overflow-hidden relative">
                                        <video src={result} controls autoPlay loop className="w-full h-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="aspect-square bg-black rounded overflow-hidden relative group">
                                        <img src={result} alt="Generated" className="w-full h-full object-contain" />
                                        <a href={result} download="generated_art.png" className="absolute bottom-4 right-4 bg-white text-black px-4 py-2 rounded text-xs font-bold uppercase opacity-0 group-hover:opacity-100 transition">
                                            Download
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreativeStudio;