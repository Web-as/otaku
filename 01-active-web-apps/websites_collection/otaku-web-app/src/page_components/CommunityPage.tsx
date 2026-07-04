'use client';

import React from 'react';
import CommunityHub from '../components/community/CommunityHub';
import { useAuth } from '../contexts/AuthContext';
import LibraryPassCTA from '@/components/membership/LibraryPassCTA';
import { useMembership } from '@/hooks/useMembership';
import { canAccessMemberLibrary } from '@/shared/membership';

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const { status } = useMembership();
  const hasPass = status ? canAccessMemberLibrary(status) : false;

  return (
    <div className="p-6 space-y-4">
      {!hasPass && (
        <LibraryPassCTA variant="inline" context="community" hasPass={hasPass} />
      )}
      <CommunityHub userId={user?.uid ?? null} onLaunchBlog={() => {}} />
    </div>
  );
};

export default CommunityPage;
