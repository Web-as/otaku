'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMembership } from '@/hooks/useMembership';
import { canAccessMemberLibrary } from '@/shared/membership';
import {
  consumeJustRegistered,
  isPassBannerDismissed,
  isPassModalDismissed,
} from '@/shared/membership/passPrompt';
import LibraryPassCTA from './LibraryPassCTA';
import FirstRegistrationPassModal from './FirstRegistrationPassModal';

export default function AppMembershipPrompts() {
  const searchParams = useSearchParams();
  const { status, loading, uid } = useMembership();
  const [showModal, setShowModal] = useState(false);

  const newMember = searchParams.get('new_member') === '1';
  const hasPass = status ? canAccessMemberLibrary(status) : false;
  const showBanner =
    Boolean(uid) && !loading && !hasPass && !isPassBannerDismissed();

  useEffect(() => {
    if (loading || !uid || hasPass) return;
    const fresh = consumeJustRegistered();
    if ((fresh || newMember) && !isPassModalDismissed()) {
      setShowModal(true);
    }
  }, [loading, uid, hasPass, newMember]);

  return (
    <>
      {showBanner && (
        <div className="sticky top-16 z-40">
          <LibraryPassCTA
            variant="banner"
            context="general"
            hasPass={hasPass}
            showDismiss
          />
        </div>
      )}
      <FirstRegistrationPassModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
