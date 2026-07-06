import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  color?: string; // Tailwind text color class
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = "Loading...", 
  color = "text-indigo-400" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-xl border border-gray-700/50">
      <Loader className={`w-8 h-8 animate-spin ${color}`} />
      <p className="mt-3 text-sm font-medium text-gray-300">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
