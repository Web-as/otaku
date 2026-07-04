'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { useMembership } from '@/hooks/useMembership';
import AdmissionCard from '@/components/membership/AdmissionCard';
import LibraryPassCTA from '@/components/membership/LibraryPassCTA';
import { STAGE_ORDER, STAGE_LABELS } from '@/shared/membership';
import { CareerLadder } from '@/shared/components/CareerLadder';
import { useGamificationOptional } from '@/shared/gamification/GamificationContext';
import { buyLibraryPass, buyProgramDownload } from '@/shared/stripe/checkout';
import { getCurrentUser } from '@/lib/firebase';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import '@/shared/styles/landing-anime.css';

const stageIndex = (s: string) => STAGE_ORDER.indexOf(s as (typeof STAGE_ORDER)[number]);

export default function MembershipHubPage() {
  const { status, loading, runInventoryAction, seriesCount, careerUnlocked } = useMembership();
  const game = useGamificationOptional();
  const [busy, setBusy] = useState(false);

  const onCardAction = async (action: string) => {
    if (!status?.admissionCard?.id) {
      if (action === 'renew' || !status?.hasValidPass) {
        const u = getCurrentUser();
        if (u?.uid && u.email) await buyLibraryPass(u.uid, u.email);
      }
      return;
    }
    setBusy(true);
    try {
      await runInventoryAction(status.admissionCard.id, action);
    } finally {
      setBusy(false);
    }
  };

  const buyApp = async () => {
    const u = getCurrentUser();
    if (!u?.uid || !u.email) {
      window.location.href = '/auth';
      return;
    }
    await buyProgramDownload(u.uid, u.email);
  };

  if (loading || !status) {
    return <div className="p-8 text-gray-400">Loading membership…</div>;
  }

  const currentIdx = stageIndex(status.stage);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 relative z-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Membership</h1>
        <p className="text-gray-400">
          Progress Guest → Library Pass → App → VIP (shop) → Super User (career only).
        </p>
      </div>

      {!status.hasValidPass && (
        <LibraryPassCTA variant="inline" context="membership" hasPass={status.hasValidPass} />
      )}

      <AdmissionCard status={status} onAction={onCardAction} busy={busy} />

      <Card>
        <h2 className="text-lg font-bold mb-4">Ladder</h2>
        <ol className="space-y-3">
          {STAGE_ORDER.map((stage, i) => {
            const done = i <= currentIdx;
            const current = i === currentIdx;
            return (
              <li
                key={stage}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  current ? 'border-[var(--anime-neon-violet)] bg-violet-500/10' : 'border-gray-800'
                }`}
              >
                {done ? (
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-600 shrink-0" />
                )}
                <div>
                  <span className="font-medium">{STAGE_LABELS[stage]}</span>
                  {current && status.nextStageLabel && (
                    <p className="text-sm text-gray-400">{status.nextStageLabel}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {!status.hasValidPass && (
        <Button
          variant="primary"
          onClick={() => {
            const u = getCurrentUser();
            if (u?.uid && u.email) buyLibraryPass(u.uid, u.email);
          }}
        >
          Get Library Pass (~€2.50/mo)
        </Button>
      )}

      {status.hasValidPass && !status.hasProgram && (
        <Button variant="outline" onClick={buyApp}>
          Buy Archivist app (one-time)
        </Button>
      )}

      <CareerLadder
        seriesCount={seriesCount}
        careerPercent={status.careerPercent}
        unlockedIds={careerUnlocked}
        gamificationRank={game?.rank}
        showConfetti={seriesCount >= 100 && careerUnlocked.includes('super_visitor')}
      />

      <Link href="/app/inventory" className="text-violet-400 hover:underline text-sm">
        View full inventory →
      </Link>
    </div>
  );
}
