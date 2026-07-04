"use client";
import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: 'violet' | 'pink' | 'cyan' | 'white' | 'none';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  href?: string;
  icon?: React.ReactNode;
  pulse?: boolean;
}

const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  glow = 'violet',
  loading = false,
  disabled = false,
  className = '',
  href,
  icon,
  pulse = false,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-widest rounded-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variants = {
    primary: 'bg-white text-black hover:bg-gray-100',
    secondary: 'bg-transparent border border-gray-600 text-white hover:border-gray-400 hover:bg-white/5',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-10 py-4 text-sm',
  };

  const glows = {
    violet: 'shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)]',
    pink: 'shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.6)]',
    cyan: 'shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)]',
    white: 'shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]',
    none: '',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${glows[glow]} ${pulse ? 'animate-pulse' : ''} ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled || loading} className={classes}>
      {content}
    </button>
  );
};

export default GlowButton;
