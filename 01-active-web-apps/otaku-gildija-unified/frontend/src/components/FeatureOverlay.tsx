
import React from 'react';
import { X } from 'lucide-react';

interface FeatureOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const FeatureOverlay: React.FC<FeatureOverlayProps> = ({ isOpen, onClose, title, icon, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-7xl h-full max-h-[90vh] bg-[#0f0e17] border border-violet-500/30 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#1a1a2e]">
          <div className="flex items-center space-x-3">
            {icon && <div className="text-pink-500">{icon}</div>}
            <h2 className="text-xl font-bold text-white uppercase tracking-widest">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition rounded-full p-1 hover:bg-white/10">
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f0e17]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FeatureOverlay;
