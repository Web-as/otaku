"use client";
import React from 'react';

interface SectionHeadingProps {
  badge?: string;
  badgeColor?: 'violet' | 'pink' | 'yellow' | 'green' | 'red' | 'blue' | 'cyan';
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

const badgeColors = {
  violet: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  pink: 'border-pink-500/30 bg-pink-500/10 text-pink-400',
  yellow: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  green: 'border-green-500/30 bg-green-500/10 text-green-400',
  red: 'border-red-500/30 bg-red-500/10 text-red-400',
  blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
};

const highlightColors = {
  violet: 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-300',
  pink: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-300',
  yellow: 'text-yellow-400',
  green: 'text-green-400',
  red: 'text-red-500',
  blue: 'text-blue-400',
  cyan: 'text-cyan-400',
};

const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  badgeColor = 'violet',
  title,
  titleHighlight,
  subtitle,
  centered = true,
  className = '',
}) => {
  return (
    <div className={`${centered ? 'text-center' : ''} mb-16 ${className}`}>
      {badge && (
        <div className={`inline-block px-3 py-1 mb-4 rounded border ${badgeColors[badgeColor]} text-[10px] font-bold uppercase tracking-widest`}>
          {badge}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-4">
        {title}{' '}
        {titleHighlight && (
          <span className={highlightColors[badgeColor]}>{titleHighlight}</span>
        )}
      </h2>
      {subtitle && (
        <p className="text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
};

export default SectionHeading;
