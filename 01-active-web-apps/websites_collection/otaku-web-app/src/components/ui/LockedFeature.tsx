import React from 'react';
import { Lock, Sparkles } from 'lucide-react';

interface LockedFeatureProps {
  children: React.ReactNode;
  isLocked: boolean;
  onUpgrade: () => void;
  message?: string;
}

const LockedFeature: React.FC<LockedFeatureProps> = ({
  children,
  isLocked,
  onUpgrade,
  message = 'Upgrade to Premium to unlock this feature'
}) => {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-[#1a1a2e] border-2 border-violet-500/50 rounded-xl p-6 text-center max-w-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Premium Feature</h3>
          <p className="text-gray-400 text-sm mb-4">{message}</p>
          <button
            onClick={onUpgrade}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 rounded-lg transition-all transform hover:scale-105 text-white font-semibold"
          >
            <Sparkles className="w-5 h-5" />
            <span>Upgrade for €1</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockedFeature;
