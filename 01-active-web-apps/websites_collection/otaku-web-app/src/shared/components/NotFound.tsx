// 404 Not Found Page Component
import type { JSX } from 'react';
import { Home, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onNavigateHome?: () => void;
  onGoBack?: () => void;
  message?: string;
}

export function NotFound({
  onNavigateHome,
  onGoBack,
  message = "The page you're looking for doesn't exist.",
}: NotFoundProps): JSX.Element {
  return (
    <div className="min-h-screen bg-[#13172a] text-stone-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="text-9xl font-black text-amber-300/90 mb-4">
          404
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-stone-100 mb-2">
          Page Not Found
        </h1>

        {/* Message */}
        <p className="text-stone-400 mb-8">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-stone-100 border border-amber-900/30 rounded-lg font-bold transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          )}
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-lg font-bold transition"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          )}
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-amber-900/30">
          <p className="text-sm text-stone-500 mb-4">
            You might be looking for:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <a 
              href="/" 
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-stone-300 border border-amber-900/30 rounded-lg text-sm transition"
            >
              Home
            </a>
            <a 
              href="/?view=login" 
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-stone-300 border border-amber-900/30 rounded-lg text-sm transition"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
