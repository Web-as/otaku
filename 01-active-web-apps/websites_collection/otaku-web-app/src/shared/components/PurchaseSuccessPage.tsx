import { Check, Download, Copy, Star, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import '../styles/landing-anime.css';
import type { PurchaseDetails } from '../utils/productKey';

interface PurchaseSuccessPageProps {
  purchaseDetails: PurchaseDetails;
  onContinue: () => void;
}

export const PurchaseSuccessPage = ({ purchaseDetails, onContinue }: PurchaseSuccessPageProps) => {
  const [copied, setCopied] = useState(false);

  const copyProductKey = () => {
    void navigator.clipboard.writeText(purchaseDetails.productKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fileContent = `
=========================================
LIBRARY OF OTAKU - DESKTOP PROGRAM
=========================================

Thank you for your purchase!

Product Key: ${purchaseDetails.productKey}
Purchase Date: ${new Date(purchaseDetails.purchaseDate).toLocaleDateString()}
Version: ${purchaseDetails.version}

INSTALLATION INSTRUCTIONS:
1. Extract the downloaded files
2. Run the installer
3. Enter your product key when prompted
4. Enjoy lifetime access!

WHAT YOU GET:
✓ Desktop program for organizing anime library
✓ Lifetime Premium on Anime Tracker (no subscription)
✓ All future updates FREE forever
✓ Pre-Registered Member badge
✓ Early access to new features

SUPPORT:
If you need help, contact support@libraryofotaku.com

=========================================
`;

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Library_of_Otaku_Setup_v1.0.0.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="landing-anime-root min-h-[100dvh] flex items-center justify-center p-4 py-12">
      <div className="landing-anime-grain" aria-hidden />
      <div className="landing-anime-content max-w-2xl w-full relative z-[1]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 min-w-[56px] min-h-[56px] bg-emerald-500 rounded-2xl mb-4 border border-emerald-300/50 hud-panel-cut motion-safe:animate-bounce">
            <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden />
          </div>
          <h1 className="anime-display text-3xl sm:text-4xl font-black mb-2 anime-text-gradient px-2">Purchase cleared</h1>
          <p className="text-lg text-zinc-300">Welcome to the Library of Otaku guild.</p>
        </div>

        <div className="hud-panel p-6 sm:p-8 mb-6">
          <div className="mb-8">
            <label className="block text-xs font-semibold text-zinc-400 mb-2">PRODUCT KEY</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 bg-black/50 border border-violet-500/30 rounded-lg px-4 py-3 font-mono text-lg sm:text-xl text-amber-300 text-center sm:text-left break-all">
                {purchaseDetails.productKey}
              </div>
              <button
                type="button"
                onClick={copyProductKey}
                className="anime-focus-ring shrink-0 min-h-[44px] px-4 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-5 h-5" aria-hidden /> : <Copy className="w-5 h-5" aria-hidden />}
                <span className="sr-only">Copy product key</span>
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Keep this key for activation.</p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <Star className="w-5 h-5 text-amber-300" aria-hidden />
              Rewards unlocked
            </h3>
            <ul className="space-y-3 text-zinc-300 text-sm">
              <li className="flex gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden /> Desktop program (per rollout)
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden /> Tracker premium positioning where offered
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden /> Future updates channel
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="anime-focus-ring w-full min-h-[48px] py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mb-4"
          >
            <Download className="w-6 h-6" aria-hidden />
            Download installer info
          </button>

          <div className="bg-black/40 rounded-lg p-4 text-sm text-zinc-300 grid grid-cols-1 sm:grid-cols-2 gap-3 border border-white/10">
            <div>
              <p className="text-zinc-500">Product</p>
              <p className="font-semibold text-white">{purchaseDetails.productName}</p>
            </div>
            <div>
              <p className="text-zinc-500">Version</p>
              <p className="font-semibold text-white">{purchaseDetails.version}</p>
            </div>
            <div>
              <p className="text-zinc-500">Purchase date</p>
              <p className="font-semibold text-white">{new Date(purchaseDetails.purchaseDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-zinc-500">Paid</p>
              <p className="font-semibold text-emerald-400">€1.00</p>
            </div>
          </div>
        </div>

        <div className="hud-panel p-6 mb-6 border-cyan-500/30">
          <h3 className="font-bold text-cyan-200 mb-3">Next steps</h3>
          <ol className="space-y-2 text-sm text-zinc-300 list-decimal list-inside">
            <li>Save your key and bundle above</li>
            <li>Install when the desktop build is available</li>
            <li>Open the tracker for premium features when granted</li>
          </ol>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="anime-focus-ring w-full min-h-[48px] py-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          Continue to tracker
          <ArrowRight className="w-5 h-5" aria-hidden />
        </button>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Key is stored locally for this demo flow; link your account where the app supports it.
        </p>
      </div>
    </div>
  );
};
