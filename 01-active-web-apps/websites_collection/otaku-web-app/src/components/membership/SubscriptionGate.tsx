'use client';

import React, { ReactNode } from 'react';
import { useMembership } from '@/hooks/useMembership';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessMemberLibrary } from '@/shared/membership';
import type { PassPromptContext } from '@/shared/membership/passPrompt';
import LibraryPassCTA from './LibraryPassCTA';

type GateRequirement = 'library_pass';

interface SubscriptionGateProps {
  required?: GateRequirement;
  children: ReactNode;
  /** Context-specific copy on the paywall */
  context?: PassPromptContext;
}

export default function SubscriptionGate({
  required = 'library_pass',
  children,
  context = 'library',
}: SubscriptionGateProps) {
  const { status, loading } = useMembership();
  const { user: devUser } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-400">
        Checking your Library Pass…
      </div>
    );
  }

  const devBypass =
    devUser?.role === 'super_user' ||
    devUser?.role === 'vip' ||
    devUser?.role === 'op' ||
    devUser?.tier === 'premium';
  const allowed =
    devBypass ||
    (required === 'library_pass' && status && canAccessMemberLibrary(status));

  if (allowed) return <>{children}</>;

  return (
    <LibraryPassCTA
      variant="gate"
      context={context}
      hiddenIfHasPass={false}
      hasPass={false}
    />
  );
}
