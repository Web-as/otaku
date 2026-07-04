'use client';

import React from 'react';
import { CreditCard, Crown, Sparkles } from 'lucide-react';
import type { MembershipStatus, UserInventoryRow } from '@/shared/membership';
import { STAGE_LABELS } from '@/shared/membership';
import Button from '../ui/Button';

interface AdmissionCardProps {
  status: MembershipStatus;
  onAction: (action: string) => Promise<void>;
  busy?: boolean;
}

function overlayLabel(card: UserInventoryRow | null): string {
  const o = card?.metadata?.card_overlay;
  if (o === 'vip') return 'VIP flair';
  if (o === 'super_visitor') return 'Super Visitor';
  return 'Library Pass';
}

export default function AdmissionCard({ status, onAction, busy }: AdmissionCardProps) {
  const card = status.admissionCard;
  const state = card?.state ?? (status.hasValidPass ? 'active' : 'expired');
  const renews = status.subscriptionEndDate
    ? new Date(status.subscriptionEndDate).toLocaleDateString()
    : '—';

  return (
    <div className="relative rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-[#2a1f4e] to-[#1a1a2e] p-6 shadow-xl overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
      <div className="flex items-start justify-between gap-4 relative">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-400/80">Admission</p>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-300" />
            Library Admission Card
          </h3>
          <p className="text-sm text-gray-400 mt-1">{overlayLabel(card)}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            state === 'active'
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'
          }`}
        >
          {state}
          {status.cancelAtPeriodEnd ? ' · ends ' + renews : ''}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 mt-6 text-sm">
        <div>
          <dt className="text-gray-500">Membership</dt>
          <dd className="font-medium">{STAGE_LABELS[status.stage]}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Renewal / end</dt>
          <dd className="font-medium">{renews}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Career</dt>
          <dd className="font-medium">{status.careerPercent}% to next milestone</dd>
        </div>
        <div>
          <dt className="text-gray-500">Super User</dt>
          <dd className="font-medium">
            {status.isSuperUser
              ? 'Earned'
              : status.superUserEligible
                ? 'Eligible'
                : 'Locked (track anime)'}
          </dd>
        </div>
      </dl>

      {card && (
        <div className="flex flex-wrap gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => onAction('view')}
          >
            View
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={busy}
            onClick={() => onAction('renew')}
          >
            Renew
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || status.cancelAtPeriodEnd}
            onClick={() => onAction('cancel')}
          >
            Cancel auto-renew
          </Button>
          {!status.isVip && !status.isSuperUser && (
            <Button
              variant="outline"
              size="sm"
              icon={Crown}
              disabled={busy}
              onClick={() => onAction('upgrade_vip')}
            >
              Upgrade VIP
            </Button>
          )}
          {status.isSuperUser && (
            <span className="inline-flex items-center gap-1 text-violet-300 text-sm">
              <Sparkles className="w-4 h-4" /> Super Visitor earned
            </span>
          )}
        </div>
      )}
    </div>
  );
}
