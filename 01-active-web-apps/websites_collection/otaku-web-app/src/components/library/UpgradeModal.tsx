import React, { useState } from 'react';
import { X, Check, Sparkles, Lock, Unlock, Zap, CreditCard, Crown, Star } from 'lucide-react';

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handlePurchase = (tier: string) => {
    setSelectedTier(tier);
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      onUpgrade();
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 animate-in fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none tilt-card-wrapper overflow-y-auto">
        <div className="my-auto relative group pointer-events-auto w-full max-w-6xl animate-in zoom-in slide-in-from-bottom-8">
          
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-white tracking-wider mb-3 tilt-card">
              <Sparkles className="w-8 h-8 text-brand-cyan-neon inline-block mr-3 mb-1 animate-pulse" />
              OTAKU <span className="text-brand-magenta-neon">NEXUS</span> PREMIUM
            </h2>
            <p className="text-gray-400 text-lg">Pasirinkite savo narystės lygį ir atrakinkite pilną potencialą.</p>
          </div>
          
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Pricing Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 tilt-card-inner items-end">
            
            {/* TIER 1: Starter */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 relative flex flex-col h-[500px]">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-2">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">€1.00</span>
                  <span className="text-sm text-gray-500 font-bold">/ vienkartinis</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Launcher atsisiuntimas + 1 mėnesio bandomasis periodas</p>
              </div>
              
              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span>Launcher Atsisiuntimas</span>
                </li>
                <li className="flex items-start gap-3 text-gray-300">
                  <Check className="w-5 h-5 text-brand-cyan-neon flex-shrink-0" />
                  <span>1 Mėnesio Premium Įrankiai</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span className="line-through">Bibliotekos Kortelė (AR Prekė)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span className="line-through">VIP Prieiga (Taverna)</span>
                </li>
              </ul>
              
              <button
                onClick={() => handlePurchase('starter')}
                disabled={isProcessing}
                className="w-full mt-6 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase tracking-wider rounded-xl transition-colors border border-gray-600"
              >
                {isProcessing && selectedTier === 'starter' ? 'Apdorojama...' : 'Pirkti Launcher'}
              </button>
            </div>

            {/* TIER 2: Library Card Holder */}
            <div className="bg-[#13111c] border-2 border-brand-magenta-neon rounded-2xl p-6 relative flex flex-col h-[540px] shadow-[0_0_30px_rgba(255,0,255,0.15)] transform md:-translate-y-4 z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-magenta-neon text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-magenta-500/50">
                Populiariausias
              </div>
              
              <div className="mb-6 mt-2">
                <h3 className="text-xl font-bold text-brand-magenta-neon uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Card Holder
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">€2.50</span>
                  <span className="text-sm text-gray-400 font-bold">/ mėn</span>
                </div>
                <p className="text-xs text-brand-magenta-neon/70 mt-2 font-bold">Visos Premium funkcijos visam laikui</p>
              </div>
              
              <ul className="space-y-4 text-sm flex-1">
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-brand-magenta-neon flex-shrink-0" />
                  <span>Nuolatinė prieiga prie Launcher</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-brand-magenta-neon flex-shrink-0" />
                  <span>Nuolatiniai Premium Įrankiai</span>
                </li>
                <li className="flex items-start gap-3 text-brand-cyan-neon font-bold">
                  <Star className="w-5 h-5 flex-shrink-0 fill-current" />
                  <span>Bibliotekos Kortelė (Permanent AR Item)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-500">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <span className="line-through">VIP Prieiga (Taverna)</span>
                </li>
              </ul>
              
              <button
                onClick={() => handlePurchase('cardholder')}
                disabled={isProcessing}
                className="w-full mt-6 py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-violet-900/50 flex items-center justify-center gap-2"
              >
                {isProcessing && selectedTier === 'cardholder' ? (
                  <span className="animate-pulse">Apdorojama...</span>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" /> Prenumeruoti
                  </>
                )}
              </button>
            </div>

            {/* TIER 3: VIP Access */}
            <div className="vip-theme glass-card border-2 !border-[#d8b56a] rounded-2xl p-6 relative flex flex-col h-[500px] overflow-hidden group/vip shadow-[0_0_40px_rgba(216,181,106,0.15)]">
              {/* VIP Shimmer */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(216,181,106,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-shimmer pointer-events-none" />
              
              <div className="relative z-10 mb-6">
                <h3 className="text-xl font-bold text-[#d8b56a] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  VIP Access
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gradient-gold">€5.00</span>
                  <span className="text-sm text-[#d8b56a]/60 font-bold">/ mėn</span>
                </div>
                <p className="text-xs text-[#d8b56a]/80 mt-2 font-bold">Ultimate Otaku Patirtis</p>
              </div>
              
              <ul className="space-y-4 text-sm flex-1 relative z-10">
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-[#d8b56a] flex-shrink-0" />
                  <span>Visi Card Holder Privalumai</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-[#d8b56a] flex-shrink-0" />
                  <span className="font-bold text-[#d8b56a]">Prieiga prie VIP Tavernos</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-[#d8b56a] flex-shrink-0" />
                  <span className="font-bold text-[#d8b56a]">Ekskliuzyvinis Auksinis UI</span>
                </li>
                <li className="flex items-start gap-3 text-white">
                  <Check className="w-5 h-5 text-[#d8b56a] flex-shrink-0" />
                  <span>VIP Discord Rolė & Beta Prieigos</span>
                </li>
              </ul>
              
              <button
                onClick={() => handlePurchase('vip')}
                disabled={isProcessing}
                className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-yellow-900/50 relative z-10"
              >
                {isProcessing && selectedTier === 'vip' ? 'Apdorojama...' : 'Tapti VIP'}
              </button>
            </div>

          </div>
          
          <div className="mt-8 text-center text-xs text-gray-600">
            Saugus mokėjimas • Atšaukite prenumeratą bet kada • Prieiga suteikiama akimirksniu
          </div>
        </div>
      </div>
    </>
  );
};

export default UpgradeModal;
