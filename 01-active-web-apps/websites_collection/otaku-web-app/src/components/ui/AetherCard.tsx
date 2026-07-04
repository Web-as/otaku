import React from 'react';

interface AetherCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  children?: React.ReactNode;
  onClick?: () => void;
}

export function AetherCard({ 
  title, 
  subtitle, 
  imageUrl, 
  rarity = 'common', 
  children,
  onClick 
}: AetherCardProps) {
  
  // Rarity styling logic
  const getRarityColor = () => {
    switch (rarity) {
      case 'legendary': return 'border-amber-400 shadow-glow-magenta';
      case 'epic': return 'border-brand-magenta-neon shadow-glow-magenta';
      case 'rare': return 'border-brand-cyan-neon shadow-glow-cyan';
      case 'uncommon': return 'border-emerald-400';
      default: return 'border-dark-border';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        bg-dark-bgSecondary inked-outline rounded-sm overflow-hidden flex flex-col
        transition-transform duration-300 hover:-translate-y-1 hover:border-brand-cyan-neon cursor-pointer
        ${getRarityColor()}
      `}
    >
      {/* Optional Image Header */}
      {imageUrl && (
        <div className="h-40 w-full relative overflow-hidden border-b border-dark-border">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x200/0a0a0c/00f0ff?text=No+Image' }}
          />
          {/* Cyberpunk diagonal cut accent */}
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-brand-cyan-neon" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
        </div>
      )}

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-display font-bold text-lg text-gray-50">{title}</h3>
        {subtitle && <p className="text-sm text-brand-cyan-400 mb-2">{subtitle}</p>}
        
        <div className="mt-auto pt-4 text-sm text-gray-400">
          {children}
        </div>
      </div>
    </div>
  );
}
