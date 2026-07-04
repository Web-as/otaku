import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  ...props
}) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-bold uppercase tracking-wider text-stone-300 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">
            {icon}
          </div>
        )}
        
        <input
          id={inputId}
          className={`
            w-full bg-slate-900/80 border rounded-lg px-4 py-2.5 text-sm text-stone-100
            placeholder-stone-500 transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-rose-500' : 'border-amber-900/40'}
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-rose-300 font-medium">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-stone-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
