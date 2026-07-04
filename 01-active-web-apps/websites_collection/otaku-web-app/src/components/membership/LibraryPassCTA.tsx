'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Backpack, X, Lock } from 'lucide-react';
import {
  getPassPromptCopy,
  dismissPassBanner,
  type PassPromptContext,
} from '@/shared/membership/passPrompt';
import { buyLibraryPass } from '@/shared/stripe/checkout';
import { getCurrentUser } from '@/lib/firebase';
import Button from '../ui/Button';

export type LibraryPassCTAVariant = 'banner' | 'sidebar' | 'inline' | 'compact' | 'gate';

interface LibraryPassCTAProps {
  variant?: LibraryPassCTAVariant;
  context?: PassPromptContext;
  /** Hide when user already has pass */
  hiddenIfHasPass?: boolean;
  hasPass?: boolean;
  showDismiss?: boolean;
  className?: string;
}

export default function LibraryPassCTA({
  variant = 'inline',
  context = 'general',
  hiddenIfHasPass = true,
  hasPass = false,
  showDismiss = false,
  className = '',
}: LibraryPassCTAProps) {
  const [dismissed, setDismissed] = useState(false);
  const copy = getPassPromptCopy(context);

  if (hiddenIfHasPass && hasPass) return null;
  if (dismissed) return null;

  const subscribe = async () => {
    const user = getCurrentUser();
    if (!user?.uid || !user.email) {
      window.location.href = '/auth?next=/app/membership';
      return;
    }
    await buyLibraryPass(user.uid, user.email);
  };

  const onDismiss = () => {
    dismissPassBanner();
    setDismissed(true);
  };

  if (variant === 'gate') {
    return (
      <div
        className={`max-w-lg mx-auto my-16 p-8 rounded-2xl border border-amber-500/30 bg-[#1a1a2e]/95 text-center ${className}`}
      >
        <Lock className="w-12 h-12 mx-auto mb-4 text-amber-400" />
        <h2 className="text-2xl font-bold mb-2">{copy.title}</h2>
        <p className="text-gray-400 mb-6">{copy.body}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" icon={CreditCard} onClick={subscribe}>
            {copy.cta}
          </Button>
          <Link href="/app/inventory">
            <Button variant="outline" fullWidth>
              View inventory
            </Button>
          </Link>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          ~€2.50/mo · Card minted to inventory after checkout
        </p>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`relative flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-amber-900/40 to-violet-900/40 border-b border-amber-500/30 ${className}`}
      >
        <div className="flex items-start gap-3 text-left">
          <Backpack className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-100">{copy.title}</p>
            <p className="text-xs text-gray-300 max-w-xl">{copy.body}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="primary" size="sm" icon={CreditCard} onClick={subscribe}>
            {copy.cta}
          </Button>
          <Link href="/app/membership" className="text-xs text-violet-300 hover:underline whitespace-nowrap">
            Membership
          </Link>
          {showDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 text-gray-500 hover:text-white"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div
        className={`mx-2 mt-4 p-3 rounded-lg border border-amber-500/25 bg-amber-950/30 ${className}`}
      >
        <p className="text-xs font-bold text-amber-200 mb-1">{copy.title}</p>
        <p className="text-[11px] text-gray-400 mb-2 leading-snug">{copy.body}</p>
        <button
          type="button"
          onClick={subscribe}
          className="w-full text-xs font-bold py-2 rounded bg-violet-600 hover:bg-violet-500 transition"
        >
          {copy.cta}
        </button>
        <Link
          href="/app/inventory"
          className="block text-center text-[10px] text-violet-300 mt-2 hover:underline"
        >
          Inventory →
        </Link>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={subscribe}
        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 transition ${className}`}
      >
        <CreditCard className="w-3 h-3" />
        {copy.cta}
      </button>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl border border-violet-500/25 bg-violet-950/20 ${className}`}
    >
      <h3 className="font-bold text-sm mb-1">{copy.title}</h3>
      <p className="text-sm text-gray-400 mb-3">{copy.body}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" icon={CreditCard} onClick={subscribe}>
          {copy.cta}
        </Button>
        <Link href="/app/membership">
          <Button variant="outline" size="sm">
            Membership hub
          </Button>
        </Link>
      </div>
    </div>
  );
}
