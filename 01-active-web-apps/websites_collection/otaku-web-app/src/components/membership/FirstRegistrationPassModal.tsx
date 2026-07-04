'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, Backpack, Sparkles, X } from 'lucide-react';
import { dismissPassModal } from '@/shared/membership/passPrompt';
import { buyLibraryPass } from '@/shared/stripe/checkout';
import { getCurrentUser } from '@/lib/firebase';
import Button from '../ui/Button';

interface FirstRegistrationPassModalProps {
  open: boolean;
  onClose: () => void;
}

export default function FirstRegistrationPassModal({
  open,
  onClose,
}: FirstRegistrationPassModalProps) {
  if (!open) return null;

  const handleLater = () => {
    dismissPassModal();
    onClose();
  };

  const handleSubscribe = async () => {
    const user = getCurrentUser();
    if (!user?.uid || !user.email) return;
    await buyLibraryPass(user.uid, user.email);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="relative max-w-md w-full rounded-2xl border border-amber-500/40 bg-[#1a1a2e] shadow-2xl p-6"
        role="dialog"
        aria-labelledby="welcome-pass-title"
      >
        <button
          type="button"
          onClick={handleLater}
          className="absolute top-3 right-3 p-1 text-gray-500 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-amber-400 text-sm font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          Welcome, registered guest
        </div>
        <h2 id="welcome-pass-title" className="text-2xl font-bold mb-2">
          Want inventory unlocked?
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          You&apos;re in as a <strong className="text-white">registered guest</strong>. The next step
          is your <strong className="text-amber-200">Library Admission Card</strong> — minted to
          inventory when you start the Library Pass (~€2.50/mo). It unlocks member library, scanner,
          quests, and interactive renew/cancel from your bag.
        </p>

        <ul className="text-sm text-gray-300 space-y-2 mb-6">
          <li className="flex gap-2">
            <Backpack className="w-4 h-4 text-violet-400 shrink-0" />
            Card appears in{' '}
            <Link href="/app/inventory" className="text-violet-400 hover:underline">
              Inventory
            </Link>
          </li>
          <li className="flex gap-2">
            <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
            Use it as your key to subscription zones
          </li>
        </ul>

        <div className="flex flex-col gap-2">
          <Button variant="primary" fullWidth icon={CreditCard} onClick={handleSubscribe}>
            Get Library Pass & mint card
          </Button>
          <Button variant="outline" fullWidth onClick={handleLater}>
            Explore first — remind me later
          </Button>
        </div>
        <p className="text-[10px] text-gray-500 text-center mt-3">
          Super User is never sold — only earned through your anime career.
        </p>
      </div>
    </div>
  );
}
