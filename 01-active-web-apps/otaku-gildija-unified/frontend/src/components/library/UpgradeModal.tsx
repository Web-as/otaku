import React, { useState } from 'react';
import { X, Check, Sparkles, Lock, Unlock, TrendingUp, Zap, Filter, Grid } from 'lucide-react';

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onUpgrade }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // In real app, this would integrate with payment gateway
      onUpgrade();
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-gray-900 border border-violet-800 rounded-xl max-w-4xl w-full shadow-2xl shadow-violet-900/50 pointer-events-auto animate-in zoom-in slide-in-from-bottom-4 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-pink-600 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-yellow-300" />
              <h2 className="text-3xl font-black uppercase text-white">Atnaujinti į Premium</h2>
            </div>
            <p className="text-violet-100 text-sm">Organizuokite savo anime biblioteką per sekundes</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Comparison */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* Free Tier */}
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-red-400 uppercase">Nemokama Versija</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-red-600">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Chaotiškas sąrašas</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-600">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Nėra filtrų</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-600">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Nėra rūšiavimo</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-600">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Nėra grupavimo</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-600">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Nėra statistikos</span>
                  </li>
                  <li className="flex items-start gap-2 text-red-600">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Paprasta paieška</span>
                  </li>
                </ul>
              </div>

              {/* Premium Tier */}
              <div className="bg-gradient-to-br from-violet-900/30 to-pink-900/30 border-2 border-violet-500 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-500 text-black px-3 py-1 text-xs font-black uppercase">
                  Tik €1!
                </div>
                <div className="flex items-center gap-2 mb-3 mt-2">
                  <Unlock className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold text-green-400 uppercase">Premium Versija</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-green-400">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Automatinis rūšiavimas</strong> (9 būdai)</span>
                  </li>
                  <li className="flex items-start gap-2 text-green-400">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Pažangūs filtrai</strong> (žanrai, studijos, metai)</span>
                  </li>
                  <li className="flex items-start gap-2 text-green-400">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Auto-grupavimas</strong> (studija/žanras/metai)</span>
                  </li>
                  <li className="flex items-start gap-2 text-green-400">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Pilna statistika</strong> (dydis, epizodai, reitingai)</span>
                  </li>
                  <li className="flex items-start gap-2 text-green-400">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Autorių/Režisierių sąrašai</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-green-400">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Pažangi paieška</strong> (visuose laukuose)</span>
                  </li>
                  <li className="flex items-start gap-2 text-green-400">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Grid/List vaizdai</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-yellow-400">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><strong>Vienkartinis mokestis</strong> - jokių prenumeratų!</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Features Showcase */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <FeatureCard icon={<Filter className="w-5 h-5" />} label="6+ Filtrai" />
              <FeatureCard icon={<TrendingUp className="w-5 h-5" />} label="9 Rūšiavimo Būdai" />
              <FeatureCard icon={<Grid className="w-5 h-5" />} label="Auto-Grupavimas" />
              <FeatureCard icon={<Zap className="w-5 h-5" />} label="Statistika" />
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl p-6 text-center mb-6">
              <div className="text-sm text-violet-200 mb-1 uppercase tracking-wider">Vienkartinis Mokestis</div>
              <div className="text-5xl font-black text-white mb-2">€1.00</div>
              <div className="text-sm text-violet-200 line-through mb-1">Buvo: €29.99</div>
              <div className="text-xs text-yellow-300 font-bold uppercase">97% Nuolaida • Visam Laikui</div>
            </div>

            {/* CTA */}
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className={`w-full py-4 rounded-lg font-black uppercase tracking-wider text-lg transition shadow-lg ${
                isProcessing
                  ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-900/50'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Apdorojama...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Unlock className="w-5 h-5" />
                  Pirkti Dabar už €1.00
                </span>
              )}
            </button>

            {/* Trust Badges */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                Saugus Mokėjimas
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                Akimirksnis Prieiga
              </div>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                Jokių Prenumeratų
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
    <div className="text-violet-400 mb-1 flex justify-center">{icon}</div>
    <div className="text-xs font-bold text-gray-300">{label}</div>
  </div>
);

export default UpgradeModal;

